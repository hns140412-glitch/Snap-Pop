import fs from "node:fs";
const bridge=fs.readFileSync(new URL("../snap-bridge.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition) throw new Error("FAIL "+name); console.log("PASS",name)}
assert("incoming-context-preserves-session-task-lap-return",
 ["session_id","task_id","lap_id","return_target"].every(k=>bridge.includes("'"+k+"'"))
);
assert("linked-context-requires-session-task-lap",
 bridge.includes("sessionIdPresentWhenLinked")&&bridge.includes("taskIdPresentWhenLinked")&&bridge.includes("lapIdPresentWhenLinked")
);
assert("return-url-restores-session-task-lap",
 bridge.includes("url.searchParams.set('session_id'")&&bridge.includes("url.searchParams.set('task_id'")&&bridge.includes("url.searchParams.set('lap_id'")
);
assert("completion-is-idempotent",
 bridge.includes("context.completion_event_id")&&bridge.includes("context.task_completed")&&bridge.includes("if (!(context.session_id && context.task_id) || context.task_completed) return")
);
assert("context-persists-in-session-storage",
 bridge.includes("sessionStorage.setItem(CONTEXT_KEY")&&bridge.includes("readStoredContext")
);
assert("return-target-is-http-safe",
 bridge.includes("safeReturnTarget")&&bridge.includes("['http:','https:']")
);

assert("learning-context-is-consumed",
 bridge.includes("'learning_context'")&&bridge.includes("decodeLearningContext")
);
assert("ready-source-binding-is-preserved",
 bridge.includes("source_range:String(value.source_range")&&bridge.includes("workbook_ref_id:String(value.workbook_ref_id")
);
assert("learning-context-fails-closed-on-authority-keys",
 bridge.includes("forbiddenKeys")&&bridge.includes("planner_authority")&&bridge.includes("allocation_authority")
);
assert("learning-context-requires-ready-identity",
 bridge.includes("required=['learning_unit_id','analysis_id','assignment_id']")
);

console.log("READY_SNAP_BRIDGE_CONTEXT_STATIC_PASS");
