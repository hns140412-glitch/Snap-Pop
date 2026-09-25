'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Scope=require('../vendor/taky/storage-scope.js');

const a={authenticated:true,family_id:'F1',member_id:'CHILD_A'};
const b={authenticated:true,family_id:'F1',member_id:'CHILD_B'};
assert.notEqual(Scope.storageKey('app/snap/db','snap_pop_rev10',a),Scope.storageKey('app/snap/db','snap_pop_rev10',b));
assert.equal(Scope.storageKey('app/snap/db','snap_pop_rev10',{}),'snap_pop_rev10');

const src=fs.readFileSync(require('node:path').join(__dirname,'..','app.js'),'utf8');
assert(src.includes("const SNAP_DB_NAME=StorageScope.storageKey('app/snap/db','snap_pop_rev10',STORAGE_SCOPE_SESSION)"));
assert(src.includes("indexedDB.open(SNAP_DB_NAME,1)"));
console.log('SNAP_FAMILY_MEMBER_SCOPE_ISOLATION_PASS');
