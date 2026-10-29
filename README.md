# mcp-myvariant

MyVariant.info MCP. Aggregated human genetic-variant annotation: dbSNP, ClinVar clinical significance, CADD/dbNSFP deleteriousness scores, gnomAD allele frequencies. Keyless BioThings API (sibling of MyGene.info). Docs: https://docs.myvariant.info/en/latest/

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1856+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## Tools

| Tool | Description |
|------|-------------|
| `query` | Search aggregated human genetic-variant annotations on MyVariant.info. Accepts an rsID ("rs58991260") or a fielded query ("dbnsfp.genename:CDK2", "clinvar.rcv.clinical_significance:pathogenic"). A bare HGVS id does NOT match here — look one up with the variant tool instead. Each hit merges dbSNP, ClinVar clinical significance, CADD/dbNSFP deleteriousness scores, and gnomAD population allele frequencies. Returns { total, hits, assembly }; hit._id is the HGVS id you can pass to the variant tool, and its coordinates are in the assembly you asked for — hg19 unless you say otherwise. |
| `variant` | Get the full merged annotation for a single human genetic variant by its HGVS id (e.g. "chr7:g.140453136A>T"). COORDINATES ARE hg19/GRCh37 BY DEFAULT — pass assembly "hg38" for GRCh38 positions, which is what gnomAD and Ensembl hand you. Returns annotations aggregated from dbSNP, ClinVar (pathogenicity / clinical significance), CADD and dbNSFP (deleteriousness/conservation scores), and gnomAD (population allele frequencies). Use to look up a known variant and read its pathogenicity and population frequency. |
| `metadata` | Returns MyVariant.info build metadata: total indexed variant count, available annotation sources (dbSNP, ClinVar, CADD, dbNSFP, gnomAD), and their current release/build versions. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "myvariant": {
      "url": "https://gateway.pipeworx.io/myvariant/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/myvariant/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1856+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/myvariant_query \
  -H 'Content-Type: application/json' \
  -d '{"query":"rs58991260"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/myvariant_query`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-myvariant` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/myvariant/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "myvariant": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-myvariant"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Myvariant data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
