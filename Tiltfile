local_resource(
    name="server",
    serve_cmd="bun run dev",
    serve_dir="apps/server",
    labels=["backend"],
    readiness_probe=probe(
        period_secs=5,
        http_get=http_get_action(port=3041, path="/"),
    ),
)

local_resource(
    name="web",
    serve_cmd="bun run dev",
    serve_dir="apps/web",
    labels=["frontend"],
    resource_deps=["server"],
)

local_resource(
    name="https-mdns",
    serve_cmd='bun run scripts/cli.ts local-https --services "frontend.local:localhost:5173,api.local:localhost:3041"',
    labels=["infra"],
    resource_deps=["web", "server"],
)
