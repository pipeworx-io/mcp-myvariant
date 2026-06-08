interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * MyVariant.info MCP.
 * Aggregated human genetic-variant annotation: dbSNP, ClinVar clinical
 * significance, CADD/dbNSFP deleteriousness scores, gnomAD allele frequencies.
 * Keyless BioThings API (sibling of MyGene.info).
 * Docs: https://docs.myvariant.info/en/latest/
 */


const BASE = 'https://myvariant.info/v1';
const UA = 'pipeworx-mcp-myvariant/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'query',
    description:
      'Search aggregated human genetic-variant annotations on MyVariant.info. Accepts an rsID ("rs58991260"), an HGVS id ("chr1:g.218631822G>A"), or a fielded query ("dbnsfp.genename:CDK2", "clinvar.rcv.clinical_significance:pathogenic"). Each hit merges dbSNP, ClinVar clinical significance, CADD/dbNSFP deleteriousness scores, and gnomAD population allele frequencies. Returns { total, hits }; hit._id is usually the HGVS id you can pass to the variant tool.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'rsID, HGVS id, or fielded query. e.g. "rs58991260", "chr1:g.218631822G>A", "dbnsfp.genename:CDK2".',
        },
        fields: { type: 'string', description: 'Comma-separated return fields (default: all). e.g. "dbsnp,clinvar,cadd.phred,gnomad_genome.af".' },
        size: { type: 'number', description: 'Max hits to return, 1-1000 (default 10).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'variant',
    description:
      'Get the full merged annotation for a single human genetic variant by its HGVS id (e.g. "chr7:g.140453136A>T"). Returns annotations aggregated from dbSNP, ClinVar (pathogenicity / clinical significance), CADD and dbNSFP (deleteriousness/conservation scores), and gnomAD (population allele frequencies). Use to look up a known variant and read its pathogenicity and population frequency.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'An HGVS variant id, e.g. "chr7:g.140453136A>T".' },
        fields: { type: 'string', description: 'Comma-separated return fields (default: all). e.g. "clinvar,gnomad_genome.af,cadd.phred".' },
      },
      required: ['id'],
    },
  },
  {
    name: 'metadata',
    description: 'Dataset statistics and source/release metadata for MyVariant.info (available data sources, build versions, total variant counts).',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  try {
    switch (name) {
      case 'query': {
        const p = new URLSearchParams({
          q: reqStr(args, 'query', '"rs58991260"'),
          size: String(Math.min(1000, Math.max(1, (args.size as number) ?? 10))),
        });
        if (args.fields) p.set('fields', String(args.fields));
        const data = (await mGet(`/query?${p}`)) as { total?: unknown; hits?: unknown };
        return { total: data.total, hits: data.hits };
      }
      case 'variant': {
        const id = reqStr(args, 'id', '"chr7:g.140453136A>T"');
        const p = new URLSearchParams();
        if (args.fields) p.set('fields', String(args.fields));
        const qs = p.toString() ? `?${p}` : '';
        const res = await fetch(`${BASE}/variant/${encodeURIComponent(id)}${qs}`, {
          headers: { Accept: 'application/json', 'User-Agent': UA },
        });
        if (res.status === 404) return { error: 'variant not found', id };
        if (!res.ok) return { error: `MyVariant: ${res.status}` };
        return res.json();
      }
      case 'metadata':
        return mGet('/metadata');
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

async function mGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`MyVariant: ${res.status}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
