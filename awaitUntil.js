globalThis.ctxAwaitUntil = function(ctx) {
    ctx.awaitUntil=async function(promise){
        ctx.waitUntil(promise);
        return await promise;
    }
    return ctx
}

export default {
    fetch(request, env, ctx) {
        return ctxAwaitUntil(ctx).awaitUntil(onRequest(request, env, ctx));
    },
};
