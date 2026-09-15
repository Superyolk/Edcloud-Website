// content.js — authoritative copy + asset URLs, lifted verbatim from the reference prototypes.
// Copied from "EdCloud Website/design_handoff_edcloud_site/content.js" with two mechanical fixes:
//   1. the shipped file redeclared `const press`, `const services` and `const results` and pushed the last two
//      logos twice (a SyntaxError, and 50 logos instead of 48) — the duplicate blocks are removed;
//   2. the one local logo (UC San Diego) points at /images/ucsd-logo.png (the same file, copied to public/).
// No string was retyped.
const W = 'https://static.wixstatic.com/media/';
export const HOME = (() => {
const logos = [
      ['c8e843_d6c0201a0d0a4178ad663394b776cf4e~mv2.png/v1/fill/w_740,h_212,al_c,q_85,enc_avif,quality_auto/Screenshot%202024-12-27%20161404_edited.png', 'Client logo'],
      ['c8e843_ce8f775c12cf431f92bbc790d5b4dfe3~mv2.png/v1/fill/w_382,h_102,al_c,q_85,enc_avif,quality_auto/logo.png', 'Client logo'],
      ['c8e843_0566d8b1fc3742ef90611d25215ba451~mv2.png/v1/fill/w_584,h_584,al_c,q_85,enc_avif,quality_auto/download_edited.png', 'Client logo'],
      ['c8e843_a963f965f80046eea51c16ad291b7f7f~mv2.png/v1/fill/w_980,h_285,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/LAUSD_combo_seal_wordmark.png', 'LAUSD'],
      ['c8e843_a1336967a7344a058b8bbdae5a90c76f~mv2.avif/v1/fill/w_348,h_113,al_c,q_80,enc_avif,quality_auto/Project-Wayfinder-Logo-1.avif', 'Project Wayfinder'],
      ['c8e843_e4964622324c40229182df7904941e8e~mv2.png/v1/fill/w_980,h_348,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Reach-Capital_edited.png', 'Reach Capital'],
      ['c8e843_cd8c28e0a6f24089875ad90fda41a7f5~mv2.png/v1/fill/w_980,h_262,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/tutor-me-logo_edited.png', 'TutorMe'],
      ['c8e843_92f833045ba14bf5b558c019ae349612~mv2.avif/v1/fill/w_310,h_138,al_c,q_80,enc_avif,quality_auto/Green_Dot_Logo_colored_large-3.avif', 'Green Dot'],
      ['c8e843_eebf78d2b6d9470e8343187c4689b8ac~mv2.avif/v1/fill/w_203,h_158,al_c,q_80,enc_avif,quality_auto/edthena%20logo.avif', 'Edthena'],
      ['c8e843_ccb3315878e8419fa26407c6147f1a67~mv2.avif/v1/fill/w_354,h_158,al_c,q_80,enc_avif,quality_auto/amplify.avif', 'Amplify'],
      ['c8e843_66676ff8948944618ed8135687192ec0~mv2.avif/v1/fill/w_599,h_88,al_c,q_80,enc_avif,quality_auto/d7cdce1fa9e5ffa5cb7e803595de075f.avif', 'Client logo'],
      ['c8e843_8e6c314576bf41aaaa36dddaeb2da4ed~mv2.avif/v1/fill/w_204,h_123,al_c,q_80,enc_avif,quality_auto/4ea681199fe7a2a4c3a151e84238202c.avif', 'Client logo'],
      ['c8e843_370e2a74460146d8a65295a7e7a1fcf9~mv2.avif/v1/fill/w_405,h_291,al_c,q_80,enc_avif,quality_auto/BookNook%2BLogo%2BTransparent%2BBackground.avif', 'BookNook'],
      ['c8e843_d23e2096934b4c289547d8fef3cb287b~mv2.avif/v1/fill/w_283,h_48,al_c,q_80,enc_avif,quality_auto/everfi-logo_2x.avif', 'EVERFI'],
      ['c8e843_114bbe75281646f19dd7af699c10646e~mv2.avif/v1/fill/w_214,h_75,al_c,q_80,enc_avif,quality_auto/5a7dd28e77769600019cc8c7_CoverLogo-V3_pn.avif', 'Client logo'],
      ['c8e843_fe8bd6454d844c8fb495fdaa8e36c68a~mv2.png/v1/fill/w_980,h_708,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/TCSA_Logo_edited.png', 'TCSA'],
      ['c8e843_6b79bd3b42f84732b24d4d9b6a69666e~mv2.avif/v1/fill/w_550,h_88,al_c,q_80,enc_avif,quality_auto/logo.avif', 'Client logo'],
      ['c8e843_06f1a41a5bc841f78bb1e1c545b0b604~mv2.avif/v1/fill/w_309,h_168,al_c,q_80,enc_avif,quality_auto/Berkeley-City-College-Logo-tagline-est-d.avif', 'Berkeley City College'],
      ['c8e843_774f92403ed34bbfa10d6ae250e91fd0~mv2.png/v1/fill/w_980,h_325,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/5b9694cf6708aa306ce38e4e_Untitled-2-13_p_edited.png', 'Client logo'],
      ['c8e843_dfd8566405d643b5a312bad8f1fb581b~mv2.png/v1/fill/w_980,h_507,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/emerson-collective-preview_edited.png', 'Emerson Collective'],
      ['c8e843_6d283bf0f693456ab7a4a51646d4282a~mv2.png/v1/fill/w_980,h_487,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Bullseye-logo.png', 'Bullseye'],
      ['c8e843_8c54e93f92c14c2aa7a291a510e6834e~mv2.png/v1/fill/w_738,h_216,al_c,q_85,enc_avif,quality_auto/isukn9-Lindsay_Leads_logo_edited.png', 'Lindsay Leads'],
      ['c8e843_98e482ddd8e74b89a8e587f5cfc3240d~mv2.avif/v1/fill/w_278,h_100,al_c,q_80,enc_avif,quality_auto/Classavo-LogoWordmark-Flat-1-300x110.avif', 'Classavo'],
      ['c8e843_dcbef49290954f28b394aad9067a9df3~mv2.png/v1/fill/w_980,h_542,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/youth-radio-logo_edited.png', 'Youth Radio'],
      ['c8e843_7944459448ee4dbcad73ab8e1ee52019~mv2.png/v1/fill/w_480,h_129,al_c,q_85,enc_avif,quality_auto/brand_logo.png', 'Client logo'],
      ['c8e843_0551cc18ac034e0ea88a92cae312d00e~mv2.avif/v1/fill/w_286,h_178,al_c,q_80,enc_avif,quality_auto/HGPAssets_SecondaryLogo_Black-1-e1515176.avif', 'HGP'],
      ['c8e843_460ed75c7154449d805790eb02fcabae~mv2.avif/v1/fill/w_213,h_123,al_c,q_80,enc_avif,quality_auto/static1_squarespace.avif', 'Client logo'],
      ['c8e843_d9541cb143ce4578abde62ad6f148afc~mv2.png/v1/fill/w_716,h_716,al_c,q_90,enc_avif,quality_auto/SFUSDBlueCroppedSM_400x400_edited.png', 'SFUSD'],
      ['c8e843_bf23bf045f534aa59a798839169a9fcc~mv2.avif/v1/fill/w_316,h_83,al_c,q_80,enc_avif,quality_auto/4_%20OUSD_header_logo_web.avif', 'OUSD'],
      ['c8e843_33eb8d8e6757490cb1411ccc84874f22~mv2.jpg/v1/fill/w_760,h_272,al_c,q_80,enc_avif,quality_auto/download%20(1)_edited.jpg', 'Client logo'],
      ['c8e843_8b403ec61ec541f59d083e9d440e9203~mv2.png/v1/fill/w_980,h_245,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/nyu_edited.png', 'NYU'],
      ['c8e843_62edd59963a1484c80b14c04de8c8b35~mv2.avif/v1/fill/w_205,h_205,al_c,q_80,enc_avif,quality_auto/9860f78c6c05046836be258e396238eb.avif', 'Client logo'],
      ['c8e843_55480af8a6624e0ea4f0c0e25efff8f5~mv2.png/v1/fill/w_431,h_139,al_c,q_85,enc_avif,quality_auto/pearson-00_edited.png', 'Pearson'],
      ['c8e843_12948341fdbe468b8d39666ba4073892~mv2.png/v1/fill/w_980,h_457,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/CFund_Logo_Wide_Navy.png', 'CFund'],
      ['c8e843_bf750abd66b94774929105cfb4ac8625~mv2.png/v1/fill/w_310,h_61,al_c,q_85,enc_avif,quality_auto/Screenshot%202024-12-27%20160226.png', 'Client logo'],
      ['c8e843_07a4a6c1fbed4b7b85667b5b33aac3d1~mv2.png/v1/fill/w_608,h_224,al_c,q_85,enc_avif,quality_auto/Screenshot%202024-12-27%20160252.png', 'Client logo'],
      ['c8e843_0cf8f6dae4e9412bb5afe670fbd9d93b~mv2.png/v1/fill/w_980,h_335,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo_png.png', 'Client logo'],
      ['c8e843_9850528afc434c6baa4ce464e5983e40~mv2.png/v1/fill/w_512,h_512,al_c,q_85,enc_avif,quality_auto/favicon-1.png', 'Client logo'],
      ['c8e843_d638ac655b91444f859a257f754008be~mv2.png/v1/fill/w_848,h_284,al_c,q_85,enc_avif,quality_auto/Screenshot%202024-12-27%20160148.png', 'Client logo'],
      ['c8e843_6bae1e34dd7f42909c6b8f14d04dd8f8~mv2.png/v1/fill/w_980,h_185,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/EdVisorly_Logo_RGB-3.png', 'EdVisorly'],
      ['c8e843_c6785abb73cd4f1fb7dac12e2805af68~mv2.jpg/v1/fill/w_980,h_187,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/2809451f-cff3-4a68-a60f-fc1e97ba843e_Instagram-post---2_edited.jpg', 'Client logo'],
      ['c8e843_57c4521d21db44ee98d03e706348bc4b~mv2.png/v1/fill/w_980,h_220,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Copy%2Bof%2Bteachfx-logo.png', 'TeachFX'],
      ['c8e843_bc85731df97b41b496c35d6232d3add5~mv2.png/v1/fill/w_980,h_490,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/EC_Logo_Horiz_Color.png', 'Client logo'],
      ['c8e843_6cd2c642c12d41c0a3463969189bbb8e~mv2.png/v1/crop/x_0,y_46,w_536,h_209/fill/w_536,h_209,al_c,q_85,enc_avif,quality_auto/new-schools-venture-fund-logo-2_0.png', 'NewSchools Venture Fund'],
      ['c8e843_9aa6465d4fa54ae2931985fc4163b27c~mv2.png/v1/fill/w_224,h_147,al_c,q_85,enc_avif,quality_auto/lumi_logo_edited.png', 'Lumi'],
      ['c8e843_433525c7a6604815863e8debf72e3a05~mv2.png/v1/fill/w_980,h_259,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/marble.png', 'Marble']
    ].map(([p, alt]) => ({ src: W + p, alt }));
    logos.push({ src: 'https://static.wixstatic.com/media/cea5d3_4c57df8f6bb54f278b60be197b04ed6f~mv2.png/v1/fill/w_600,h_600,al_c,q_85,enc_avif,quality_auto/cea5d3_4c57df8f6bb54f278b60be197b04ed6f~mv2.png', alt: 'Worksheets AI' });
    logos.push({ src: '/images/ucsd-logo.png', alt: 'UC San Diego' });
    const press = [
      // Added after the handoff. Source, headline and date are taken from the article's own metadata
      // (og:title and article:published_time), not retyped from the page.
      { source: 'EdWeek Market Brief', date: 'Sep 2026', title: 'Lemnis, Public Charity Born From NWEA Sale, Makes First K-12 Acquisition', href: 'https://marketbrief.edweek.org/strategy-operations/lemnis-public-charity-born-from-nwea-sale-makes-first-k-12-acquisition/2026/09' },
      { source: 'Built in SF', date: 'Jan 2020', title: "Now Valued at $3.5B, Handshake is Poised to Be Gen Z's Linkedin", href: 'https://www.builtinsf.com/articles/handshake-raises-200m-3b-valuation-hiring' },
      { source: 'The Times', date: 'Aug 2022', title: 'Long Unicorn Status in the Pipeline for Virtual Internships', href: 'https://www.thetimes.com/article/long-unicorn-status-in-the-pipeline-for-virtual-internships-xdrlk75v2' },
      { source: 'Higher Ed Dive', date: 'May 2022', title: 'Zovio Sells Tutoring Services Business Tutor Me for $55M', href: 'https://www.highereddive.com/news/zovio-sells-tutoring-services-business-for-55m/624320/' },
      { source: 'CISION', date: 'Jan 2022', title: 'Social Emotional and Life Readiness Provider Wayfinder Closes $6.6M Series A Round', href: 'https://www.prweb.com/releases/social-emotional-and-life-readiness-provider-wayfinder-closes-6-6-million-series-a-round-868041674.html' }
    ];
const capabilities = [
      ['Rapid Product Development and Validation', 'Find the parts of your product that K12 and higher ed buyers actually pay for, and prove it in market fast.'],
      ['Sales, Marketing, Operations, and Customer Success Transformation', 'Rebuild the revenue team end to end, from first outreach to renewal, so every handoff is clean.'],
      ['Hypergrowth Strategy, Tactics, and Execution', 'A plan built on playbooks that already worked, then run alongside your team until it sticks.'],
      ['Scaling Outreach from Local to National', 'Turn a regional foothold into a national footprint with territory plans, channels, and procurement paths.'],
      ['Growth Team Training and Evaluation', 'Hire, coach, and measure the people who will own the motion after we step back.'],
      ['Fundraising and Capital Performance', 'Raise on the strength of a repeatable engine, and put the capital where it compounds.']
    ].map(([label, desc], i) => ({ n: String(i + 1).padStart(2, '0'), label, desc }));
    const services = [
      { n: '01', title: 'Nationwide Hypergrowth', body: 'From tiny foothold to total ubiquity, our team can help plan and navigate your fastest path to national scale. Dramatically shortcut your sales and marketing learning curve while avoiding costly mistakes, and cut out years of wasted effort by putting our market-proven growth strategies to work.' },
      { n: '02', title: 'Ubiquitous Market Awareness', body: 'Don\'t just adopt the gold standard. Become one. We have helped build some of the best-known education technology brands ever, from inception to ubiquity - and we can help your company go from "virtually unknown" to "virtually everywhere" faster and more reliably than anybody else.' },
      { n: '03', title: 'Supercharged Product Market Fit', body: 'We can\'t help you work harder - you\'re going to have to do that on your own. But we can help you work smarter and move faster by supercharging the core components of your value prop and PMF that resonate best with K12 and higher education decision makers - focusing on the parts of your product that truly sell.' }
    ];
const cases = [
      { n: '01', stat: '$3.5B', statLabel: 'Handshake was last valued at over $3.5B.', title: 'Join Handshake. 520 Times', body: 'We helped the team at Handshake expand from an initial foothold of 30 universities to over 550 - building and executing one of the fastest and most successful higher education growth campaigns of all time.' },
      { n: '02', stat: '$3B', statLabel: 'Outschool was last valued at over $3B.', title: 'Outschool, Pandemic Mode', body: 'We started working with Outschool during the first month of the pandemic lockdowns, quickly helping their team build an enterprise sales operation and successfully adapt to a dramatically different K12 landscape.' },
      { n: '03', stat: '$100M', statLabel: 'Wayfinder was last valued at over $100M.', title: 'Wayfinding from $0 to $15M ARR', body: 'We started working with the team at Wayfinder when they were doing less than $50k in sales. Today they are used by over a million students, and are the fastest growing SEL company in the United States.' },
      { n: '04', stat: '$500M', statLabel: 'Clever was acquired by Kahoot for $500M.', title: 'Get Clever. To 90% Market Share', body: 'We helped build the Clever K12 sales and marketing teams from the ground up, guiding the company from 10% to 90% market share in just under 2 years - the fastest K12 technology takeover ever.' }
    ];

  return { logos, press, capabilities, services, cases };
})();
export const SERVICES = (() => {
const proof = [
      { stat: '30 → 550', label: 'universities in one growth campaign', client: 'Handshake' },
      { stat: '10% → 90%', label: 'K12 market share in under two years', client: 'Clever' },
      { stat: '300 → 1.5M', label: 'students using the product', client: 'Wayfinder' },
      { stat: '$500M', label: 'acquisition by Kahoot', client: 'Clever' }
    ];
const phases = [
      { n: '01', duration: '2 to 3 weeks', title: 'Discovery sprint', body: 'We align on goals, constraints, and the fastest path to value. You leave with a ranked list of what is actually blocking scale and which services address it.' },
      { n: '02', duration: '60 to 90 days', title: 'Build', body: 'We craft the narrative, stand up the sales system, and remove the biggest friction in legal and procurement. Where needed we recruit or upskill the first hires who will own the motion.' },
      { n: '03', duration: 'Ongoing, optional', title: 'Run and hand off', body: 'Your team runs the playbook. Many clients keep us on for major deals, launches, and partner negotiations. The aim is a machine that keeps delivering after we leave.' }
    ];
const services = [
      ['GTM Strategy & Positioning', 'A buyer-centric narrative, tested in live conversations and backed by the proof your prospects care about. Who you serve, what each stakeholder gets, and why you are the inevitable choice.', 'Higher win rates and shorter cycles from a clear “why now, why us.”', 'Teams whose pitch changes every meeting, or who sell well to one persona and stall with the rest.', 'Positioning brief, messaging matrix, competitive traps, proof library, talk tracks.', '2 to 4 months'],
      ['Self-Perpetuating Sales Engine', 'A full-funnel K12 or higher ed system from lead generation to signed contract, built to move from founder-led selling to a team that can carry multi-state and multi-system deals.', 'Predictable pipeline that does not depend on the founder.', 'Companies past $500k ARR that need the next $5M to come from a repeatable motion.', 'Territory models, account lists, sequencing, demo flows, objection handling, enablement, hiring profiles.', '6 to 12 months to stand up'],
      ['Competitive Pricing & Packaging', 'Monetization that matches the value you deliver and the way institutions actually buy. Price points tested in market, tiers that scale, and a negotiation strategy that avoids endless pilots.', 'Higher ACV, clean renewals, standard terms.', 'Teams discounting to close, running unpaid pilots, or renegotiating every renewal.', 'Market-tested price points, bundles and tiers, pilot-avoidance strategy, negotiation playbook.', '3 to 6 months'],
      ['High-Yield Channel Partnerships', 'Platform integrations, resellers, and alliances that put you inside the stack your buyers already trust, with the partner story and terms to make it worth their while.', 'Net new pipeline from routes already in the buyer’s stack.', 'Products that integrate with an LMS, SIS, or rostering platform and have not yet made that a sales channel.', 'Target list, partner value story, BD outreach kit, term sheets, co-marketing plans.', '3 to 4 months to signed partners'],
      ['Smarter Procurement Pathways', 'De-risked purchase paths for large districts and universities: how to engage before the RFP, how to answer it, and how to clear security, privacy, and legal without losing a semester.', 'More large contracts closed, fewer stalled in legal.', 'Teams with big deals stuck in procurement, or who have never won a formal RFP.', 'Pre-RFP engagement plan, RFP response kit, sole-source and justification templates, privacy and security responses, contracting playbook.', '3 to 4 weeks to baseline; ongoing per deal'],
      ['RevOps & Customer Outcomes', 'One integrated system for outreach, engagement, renewals, and expansion, so Sales, Success, and Product hand off cleanly and the forecast is one your board can trust.', 'Forecast accuracy and higher NRR.', 'Companies whose CRM does not match reality, or whose renewals surprise them.', 'GTM engineering plan, CRM architecture, stage definitions, MEDDICC or similar, QBR templates, onboarding and value-proof checklists.', '3 to 6 months']
    ].map(([title, pitch, result, fit, deliverables, timeline], i) => ({ n: String(i + 1).padStart(2, '0'), title, pitch, result, fit, deliverables, timeline }));
    const results = [
      { client: 'Handshake', start: 'A foothold of 30 universities', built: 'One of the fastest higher ed growth campaigns on record', outcome: '550+ universities; last valued at over $3.5B' },
      { client: 'Clever', start: '10% K12 market share', built: 'Sales and marketing teams from the ground up', outcome: '90% share in under 2 years; acquired by Kahoot for $500M' },
      { client: 'Wayfinder', start: 'Under $50k in sales', built: 'A national K12 sales motion for SEL', outcome: '$15M ARR; over a million students; last valued at over $100M' },
      { client: 'Outschool', start: 'Month one of pandemic lockdowns', built: 'An enterprise sales operation for a changed K12 market', outcome: 'Last valued at over $3B' }
    ];
  return { proof, phases, services, results };
})();
