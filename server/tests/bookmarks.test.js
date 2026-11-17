const { test } = require('node:test');
const assert = require('node:assert/strict');
const controller = require('../controllers/Bookmark');
const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const ownerId='507f191e810c19729de860ea',bookmarkId='507f1f77bcf86cd799439011';
function res(){return {statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};}
const req=()=>({user:{id:ownerId},params:{id:bookmarkId},body:{title:'Story',url:'https://publisher.example/story'}});

test('empty favourites are always returned as an array',async t=>{
 t.mock.method(User,'findById',()=>({populate:()=>({exec:async()=>({bookmarkedNews:[]})})}));
 const result=res();await controller.getAllBookmarkedNews(req(),result);assert.deepEqual(result.body.bookmarkedNews,[]);
});
test('deleting an already missing document cleans the user reference successfully',async t=>{
 t.mock.method(User,'findById',async()=>({_id:ownerId,bookmarkedNews:[bookmarkId]}));
 t.mock.method(Bookmark,'findByIdAndDelete',async()=>null);
 let update;t.mock.method(User,'findByIdAndUpdate',async(id,value)=>{update=value;});
 const result=res();await controller.deleteBookmarkedNews(req(),result);assert.equal(result.statusCode,200);assert.deepEqual(update,{$pull:{bookmarkedNews:bookmarkId}});
});
test('repeated deletion succeeds without deleting documents belonging to another account',async t=>{
 t.mock.method(User,'findById',async()=>({_id:ownerId,bookmarkedNews:[]}));
 let deleted=false;t.mock.method(Bookmark,'findByIdAndDelete',async()=>{deleted=true;});
 const result=res();await controller.deleteBookmarkedNews(req(),result);assert.equal(result.statusCode,200);assert.equal(deleted,false);
});
test('invalid bookmark IDs are rejected before database operations',async()=>{
 const request=req();request.params.id='undefined';const result=res();await controller.deleteBookmarkedNews(request,result);assert.equal(result.statusCode,400);
});
test('saving an existing URL returns its original canonical ID',async t=>{
 t.mock.method(User,'findById',async()=>({_id:ownerId,bookmarkedNews:[bookmarkId]}));
 t.mock.method(Bookmark,'findOne',async()=>({_id:bookmarkId,url:req().body.url}));
 let created=false;t.mock.method(Bookmark,'create',async()=>{created=true;});
 const result=res();await controller.addToBookmarkedNews(req(),result);assert.equal(result.body.savedArticle._id,bookmarkId);assert.equal(created,false);
});
test('new saves return the actual document ID and exclude private user fields',async t=>{
 t.mock.method(User,'findById',async()=>({_id:ownerId,bookmarkedNews:[]}));t.mock.method(Bookmark,'findOne',async()=>null);
 t.mock.method(Bookmark,'create',async()=>({_id:bookmarkId,...req().body}));
 t.mock.method(User,'findByIdAndUpdate',async()=>({_id:ownerId,bookmarkedNews:[bookmarkId],password:'must-not-be-returned'}));
 const result=res();await controller.addToBookmarkedNews(req(),result);assert.equal(result.statusCode,200);assert.equal(result.body.savedArticle._id,bookmarkId);assert.equal(result.body.updatedUserData.password,undefined);
});
