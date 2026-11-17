const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createNewsDataService,toArticle}=require('../services/newsData');
function response(){return {statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};}
function request(query={}){return {query:{pageSize:'6',...query}};}
function key(t){const previous=process.env.NEWSDATA_API_KEY;process.env.NEWSDATA_API_KEY='test-only-key';t.after(()=>{if(previous===undefined)delete process.env.NEWSDATA_API_KEY;else process.env.NEWSDATA_API_KEY=previous;});}
const item={title:'Actual provider title',link:'https://publisher.example/story',image_url:'https://publisher.example/image.jpg',description:'Description',creator:['Author'],pubDate:'2026-11-17 08:00:00',source_id:'publisher',source_name:'Publisher',category:['technology']};
test('maps NewsData.io articles to existing app and bookmark fields',()=>{const a=toArticle(item);assert.equal(a.url,item.link);assert.equal(a.urlToImage,item.image_url);assert.equal(a.author,'Author');assert.equal(a.publishedAt,'2026-11-17T08:00:00.000Z');assert.equal(a.source.name,'Publisher');assert.equal(a.category,'technology');});
test('uses a provider cursor for Next and cached data for Previous',async t=>{
 key(t);const calls=[];const service=createNewsDataService({http:{get:async(url,options)=>{calls.push({url,params:options.params});return {data:{status:'success',results:[{...item,title:'Page '+calls.length}],totalResults:12,nextPage:calls.length===1?'cursor-two':null}};}}});
 const first=response();await service.getNews(request(),first);const second=response();await service.getNews(request({page:'2'}),second);const previous=response();await service.getNews(request(),previous);
 assert.equal(first.statusCode,200);assert.equal(second.body.articles[0].title,'Page 2');assert.equal(calls[1].params.page,'cursor-two');assert.equal(calls[0].params.size,6);assert.equal(calls.length,2);assert.deepEqual(previous.body.articles,first.body.articles);assert.ok(!JSON.stringify(first.body).includes('test-only-key'));
});
test('deduplicates simultaneous requests for the same page',async t=>{
 key(t);let count=0;const service=createNewsDataService({http:{get:async()=>{count++;await new Promise(resolve=>setImmediate(resolve));return {data:{status:'success',results:[item],totalResults:1,nextPage:null}};}}});
 const a=response(),b=response();await Promise.all([service.getNews(request(),a),service.getNews(request(),b)]);assert.equal(count,1);assert.deepEqual(a.body.articles,b.body.articles);
});
test('search and categories are sent to the provider correctly',async t=>{
 key(t);let params;const service=createNewsDataService({http:{get:async(url,options)=>{params=options.params;return {data:{status:'success',results:[item],totalResults:1}};}}});const r=response();await service.getNews(request({q:'space',category:'science'}),r);assert.equal(params.q,'space');assert.equal(params.category,'science');assert.equal(params.language,'en');assert.equal(params.country,undefined);
});
test('rejects invalid filters and sizes before consuming provider credits',async t=>{
 key(t);let count=0;const service=createNewsDataService({http:{get:async()=>{count++;}}});for(const query of [{page:'0'},{page:'21'},{pageSize:'11'},{pageSize:'1.5'},{q:{$ne:null}},{category:'unknown'}]){const r=response();await service.getNews(request(query),r);assert.equal(r.statusCode,400);}assert.equal(count,0);
});
test('reports missing keys clearly',async t=>{
 key(t);delete process.env.NEWSDATA_API_KEY;const r=response();await createNewsDataService().getNews(request(),r);assert.equal(r.statusCode,503);assert.equal(r.body.code,'newsKeyMissing');
});
test('provider authentication and quota failures are real HTTP errors without key leakage',async t=>{
 key(t);for(const status of [401,429]){const service=createNewsDataService({http:{get:async()=>{throw {response:{status,data:{results:{message:'secret test-only-key'}}}};}}});const r=response();await service.getNews(request(),r);assert.equal(r.statusCode,status===429?429:502);assert.equal(r.body.status,'error');assert.ok(!JSON.stringify(r.body).includes('test-only-key'));}
});
test('cache expires so later requests can retrieve updated articles',async t=>{
 key(t);let time=1000,count=0;const service=createNewsDataService({now:()=>time,http:{get:async()=>({data:{status:'success',results:[{...item,title:'Update '+(++count)}],totalResults:1}})}});const a=response();await service.getNews(request(),a);time+=300001;const b=response();await service.getNews(request(),b);assert.equal(count,2);assert.notEqual(a.body.articles[0].title,b.body.articles[0].title);
});
