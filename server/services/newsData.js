const axios = require('axios');
const CATEGORIES = new Set(['general','business','technology','science','health','sports','politics','entertainment']);
const MAX_PAGES = 20;
const TTL = 5 * 60 * 1000;
function toArticle(item) {
  const value = item.pubDate || '';
  const date = value && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value.replace(' ', 'T') + 'Z' : value;
  return {
    title: item.title, description: item.description || '', content: '',
    url: item.link, urlToImage: item.image_url || '',
    author: Array.isArray(item.creator) ? item.creator.join(', ') : item.creator || '',
    publishedAt: date && !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString() : null,
    source: { id: item.source_id || null, name: item.source_name || item.source_id || 'NewsData.io' },
    category: Array.isArray(item.category) ? item.category[0] : item.category || 'general',
  };
}
function createNewsDataService({http = axios, now = Date.now} = {}) {
  const cache = new Map();
  async function getNews(req, res) {
    const page = Number(req.query.page || 1), size = Number(req.query.pageSize || 10);
    const q = req.query.q || '', category = req.query.category || 'general';
    const language = req.query.language || 'en';
    const country = req.query.country || (q ? undefined : 'us');
    if (!Number.isInteger(page) || page < 1 || page > MAX_PAGES || !Number.isInteger(size) || size < 1 || size > 10 || !CATEGORIES.has(category) || typeof q !== 'string' || q.length > 150 || typeof language !== 'string' || !/^[a-z]{2}$/.test(language) || country && (typeof country !== 'string' || !/^[a-z]{2}$/.test(country))) {
      return res.status(400).json({status:'error',message:'Invalid news filters or page. Use 1 to 10 articles per page.',articles:[],totalResults:0});
    }
    const key = process.env.NEWSDATA_API_KEY;
    if (!key) return res.status(503).json({status:'error',code:'newsKeyMissing',message:'Set NEWSDATA_API_KEY in server/.env and restart the backend.',articles:[],totalResults:0});
    const cacheKey = JSON.stringify([q,category,language,country,size]);
    for (const [id,entry] of cache) if (entry.expires <= now()) cache.delete(id);
    let entry = cache.get(cacheKey);
    if (!entry) {
      if (cache.size >= 40) cache.delete(cache.keys().next().value);
      entry = {expires:now()+TTL,pages:[],next:undefined,total:0,pending:null};
      cache.set(cacheKey,entry);
    }
    try {
      // NewsData uses cursor tokens. Retain each page and cursor so Previous is cached,
      // and concurrent hero/list requests never issue duplicate provider calls.
      while (entry.pages.length < page) {
        if (entry.pages.length && !entry.next) break;
        if (!entry.pending) {
          entry.pending = (async()=>{
            const params = {apikey:key,language,size};
            if (country) params.country=country;
            if (category !== 'general') params.category=category;
            if (q) params.q=q;
            if (entry.next) params.page=entry.next;
            const {data} = await http.get('https://newsdata.io/api/1/latest',{params,timeout:12000,maxContentLength:2000000});
            if (data.status !== 'success' || !Array.isArray(data.results)) {
              const error=new Error('Invalid provider response');error.response={status:502,data};throw error;
            }
            entry.pages.push(data.results.filter(item=>item.title && typeof item.link==='string' && /^https?:\/\//i.test(item.link)).map(toArticle));
            entry.next = data.nextPage || null;
            entry.total = Number(data.totalResults) || entry.pages.flat().length;
          })().finally(()=>{entry.pending=null;});
        }
        await entry.pending;
      }
      const articles = entry.pages[page-1] || [];
      const availablePages = entry.next ? MAX_PAGES : entry.pages.length;
      const totalResults = Math.min(entry.total, availablePages * size);
      return res.json({status:'ok',articles,totalResults,page,pageSize:size,hasNextPage:page < availablePages && page*size < totalResults,provider:'newsdata',fetchedAt:new Date(now()).toISOString()});
    } catch(error) {
      if (!entry.pages.length) cache.delete(cacheKey);
      const status = error.response?.status;
      const timeout = ['ECONNABORTED','ETIMEDOUT'].includes(error.code);
      const message = status===401 || status===403 ? 'The news provider rejected the configured key. Check NEWSDATA_API_KEY on the server.' : status===429 ? 'The news provider request limit has been reached. Please try again later.' : timeout ? 'The news provider took too long to respond. Please try again.' : 'News is temporarily unavailable. Please try again.';
      return res.status(status===429?429:timeout?504:502).json({status:'error',code:status===429?'newsQuotaExceeded':'newsProviderError',message,articles:[],totalResults:0});
    }
  }
  return {getNews};
}
const service = createNewsDataService();
module.exports = {getNews:service.getNews,createNewsDataService,toArticle,isEnabled:()=>process.env.NEWS_PROVIDER==='newsdata' || !process.env.NEWS_PROVIDER && Boolean(process.env.NEWSDATA_API_KEY)};
