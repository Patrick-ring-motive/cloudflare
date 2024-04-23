globalThis.ctxAwaitUntil = function(ctx) {
    ctx.awaitUntil = function(promise){
        ctx.waitUntil(promise);
        return promise;
    }
    return ctx;
};

export default {
    fetch(request, env, ctx) {
        return ctxAwaitUntil(ctx).awaitUntil(onRequest(request, env, ctx));
    },
};


async function onRequest(request,env,ctx){
    return await ctx.awaitUntil(fetch('https://github.com/Patrick-ring-motive/cloudflare/blob/main/awaitUntil.js'));
}
