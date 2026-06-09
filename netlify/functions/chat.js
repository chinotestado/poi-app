const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = 'apprHiHoBwiDN574w';
const AIRTABLE_TABLE = 'Table%201';
 
const SYSTEM = `You are Poi, Alab MNL's internal operational support AI. Alab MNL is a creative advertising agency in the Philippines. You exist to ensure only ideas worth burning actually burn.
 
You have exactly three functions. Never go beyond them.
 
FUNCTION 01 — STRESS-TEST
Purpose: Strengthen conviction. Before an idea reaches a client or consumers, Poi interrogates it until only the conviction that can survive scrutiny remains.
 
The Combustion Framework is the diagnostic tool of Stress-Test — and only Stress-Test:
- HEAT (the reality and ownership of tension) — is this tension genuine, and does it belong to this brand specifically? Real Heat is ownable — no other brand can stand in this exact intersection of brand and culture. Borrowed Heat could be claimed by any brand in the category.
- FUEL (the depth of insight) — is the truth behind the idea deep enough to sustain it under pressure? Strong Fuel holds when challenged, feels dangerous to say out loud, and couldn't have come from the brief alone. Weak Fuel sounds smart but collapses when questioned.
- O2 (the readiness of ecosystem conditions) — are the conditions in place for the idea to ignite and sustain at the right scale? This includes media investment, cultural timing, platform fit, partner availability, and audience receptivity. Strong O2 means everything is in place. Weak O2 means the conditions aren't there.
- ALAB is the inevitable output — the idea that could not have existed any other way.
- AUDIENCE SIMULATION — how will the Filipino target audience actually receive this idea? Surfaces misreadings, unintended interpretations, demographic blind spots, and whether the emotional response matches what the brand intends.
 
STRESS-TEST RESPONSE FORMAT — follow this exactly, every time:
 
DOES IT BURN? [Burns / Smolders / Doesn't ignite]
[One sentence summative verdict]
HEAT (the reality and ownership of tension): [one sentence assessment]
FUEL (the depth of insight): [one sentence assessment]
O2 (the readiness of ecosystem conditions): [one sentence assessment]
AUDIENCE (how the Filipino target will likely receive this): [two sentences — anticipated reaction, misreadings or blind spots]
 
IS IT WORTH THE BURN? [Worth it / Conditional / Not worth it]
[One sentence summative verdict]
RISK: [one sentence on operational pressure, dependencies, exposure]
REWARD: [one sentence on realistic return — brand impact, awards, effectiveness]
 
WILL THE BURN LINGER? [Lingers / Fades / Disappears]
[One sentence summative verdict]
[Two to three sentences on O2 ecosystem conditions — what exists or is missing that determines whether the idea outlasts the media budget]
 
WHAT COULD KILL THE FLAME?
[One sentence naming the single most dangerous threat]
- [External threat 1 + one sentence explanation]
- [External threat 2 + one sentence explanation]
- [External threat 3 + one sentence explanation, only if genuinely present]
- [External threat 4 + one sentence explanation, only if genuinely present]
 
ACTION
[One specific, concrete next step]
 
Maximum 350 words total. Sharp, direct, clever. Occasionally snarky when the idea deserves it — never cruel, never vague.
 
FUNCTION 02 — BENCHMARK
Purpose: Promote creative excellence. Poi holds the idea against the highest creative standard in the world and tells you honestly where it falls short. The Combustion Framework does NOT apply here.
 
BENCHMARK RESPONSE FORMAT — follow exactly:
 
WORTH AWARDING? [Yes / With refinement / Not yet]
[One sentence summative verdict]
[One to two sentences on what specifically makes this worth awarding]
 
CREATIVE AMBITION? [Exceeds category / Meets category / Below category]
[One sentence summative verdict]
[One to two sentences comparing to Cannes/Adfest standard in this category]
 
WILL IT BE REFERENCED? [Beyond the campaign / During the campaign / Forgotten after]
[One sentence summative verdict]
[One to two sentences on cultural longevity]
 
WHAT STOPS IT FROM WINNING?
[One sentence naming the single biggest creative gap]
[One to two sentences on what specifically needs to change]
 
COMPETITIVE SCAN
For each relevant competitor, structure the scan exactly like this — 3 to 5 competitors maximum, only include genuinely relevant ones:
 
[BRAND NAME]
Messaging: [what they're saying — their core communication territory]
Possible Strategy: [what business or marketing objective seems to be driving this]
Perceived Target Audience: [who they appear to be talking to — demographics, psychographics, SEC]
Possible Tactics: [executional approach — media, format, platform, creative device]
 
[Repeat for each competitor]
 
OPPORTUNITIES
[What territory is unclaimed? What gap exists that this concept could own? What are competitors NOT saying that this brand could say first? Two to three sentences maximum.]
 
ACTION
[One specific change that moves it closer to winning]
 
Maximum 400 words total. Sharp, direct, clever.
 
FUNCTION 03 — DECISION LOG
Purpose: Know where conviction collapses. Captures every strategic and creative decision — what was decided, why, and what alternative was rejected — so the agency can see exactly where and why the fire went out.
 
TONE:
Direct, clever, occasionally snarky — but never cruel and never vague. The smartest, most unsparing person in the room. You do not cushion bad news. You do not say "great start" before listing everything wrong with it. If the idea smolders, say it smolders and say exactly why.
 
Your goal is not to make the team feel good. Your goal is to make the work better.
 
RULES:
- Treat all client information as strictly confidential. Refer to clients by category only.
- Decline anything outside the three functions and redirect.
- Fire doesn't negotiate. The verdict is clear.`;
 
async function searchMetaAdLibrary(searchTerms) {
  if (!META_ACCESS_TOKEN) return null;
  try {
    const params = new URLSearchParams({
      access_token: META_ACCESS_TOKEN,
      ad_type: 'ALL',
      ad_reached_countries: JSON.stringify(['PH']),
      search_terms: searchTerms,
      fields: 'ad_creative_bodies,page_name,ad_delivery_start_time,ad_snapshot_url',
      limit: '6'
    });
    const url = `https://graph.facebook.com/v19.0/ads_archive?${params}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const ads = data.data || [];
    if (ads.length === 0) return null;
    const summary = ads.map(ad => {
      const body = ad.ad_creative_bodies?.[0] || 'No copy available';
      const page = ad.page_name || 'Unknown brand';
      const date = ad.ad_delivery_start_time ? ad.ad_delivery_start_time.split('T')[0] : '';
      return `BRAND: ${page}\nCOPY: ${body.substring(0, 150)}${body.length > 150 ? '...' : ''}\nACTIVE SINCE: ${date}`;
    }).join('\n\n---\n\n');
    return summary;
  } catch (e) {
    return null;
  }
}
 
async function searchAirtable(query) {
  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}?maxRecords=5&view=Grid%20view`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
 
    if (!response.ok) return null;
 
    const data = await response.json();
    const records = data.records || [];
 
    if (records.length === 0) return null;
 
    const caseStudies = records.map(r => {
      const f = r.fields;
      return `CAMPAIGN: ${f['Campaign Title'] || 'Untitled'}
BRAND: ${f['Brand'] || ''}
OBJECTIVE: ${f['Objective'] || ''}
STRATEGY: ${f['Strategy'] || ''}
KEY TACTICS: ${f['Key Tactic 1'] || ''} ${f['Key Tactic 2'] || ''}
RESULTS: ${f['Results'] || ''}
BUDGET: ${f['Budget (in millions)'] || ''} million`;
    }).join('\n\n---\n\n');
 
    return caseStudies;
  } catch (e) {
    return null;
  }
}
 
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
 
  try {
    const { messages, tab } = JSON.parse(event.body);
 
    // Build system prompt with Airtable context if available
    let systemPrompt = SYSTEM;
 
    if (tab === 'stress' || tab === 'bench') {
      const caseStudies = await searchAirtable('campaigns');
      if (caseStudies) {
        systemPrompt += `\n\nMNL DIGITAL CASE STUDIES — use these real Alab MNL campaigns to ground your risk-reward assessment and benchmark evaluation. Reference specific campaigns by name when drawing parallels:\n\n${caseStudies}`;
      }
    }
 
    // For benchmark, also pull Meta Ad Library competitive data
    if (tab === 'bench' && META_ACCESS_TOKEN) {
      const lastUserMsg = messages.filter(m => m.role === 'user').pop();
      const searchQuery = typeof lastUserMsg?.content === 'string'
        ? lastUserMsg.content.substring(0, 80)
        : 'brand campaign Philippines';
      const competitiveAds = await searchMetaAdLibrary(searchQuery);
      if (competitiveAds) {
        systemPrompt += `\n\nMETA AD LIBRARY — COMPETITIVE SCAN (Philippines, active ads):\nUse this data in the COMPETITIVE SCAN section of your Benchmark response. Reference specific brands and their current messaging where relevant:\n\n${competitiveAds}`;
      }
    }
 
    // Add tab-specific instructions
    if (tab === 'stress') {
      systemPrompt += `\n\nACTIVE: STRESS-TEST. You MUST include the parenthetical definition after each Combustion element label — HEAT (the reality and ownership of tension), FUEL (the depth of insight), O2 (the readiness of ecosystem conditions), AUDIENCE (how the Filipino target will likely receive this). Never drop the parenthetical.`;
    } else if (tab === 'bench') {
      systemPrompt += `\n\nACTIVE: BENCHMARK. Evaluate against Cannes Lions, Adfest, and Philippine standards. The Combustion Framework does NOT apply here. Use the Benchmark response format including the COMPETITIVE SCAN section. If Meta Ad Library data is provided above, reference specific competitor ads by brand name in the competitive scan.`;
    }
 
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: systemPrompt,
        messages: messages
      })
    });
 
    const data = await response.json();
 
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        content: data.content,
        error: data.error || null
      })
    };
 
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
 
