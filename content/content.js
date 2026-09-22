// content.js — authoritative copy + asset URLs, lifted verbatim from the reference prototypes.
// Copied from "EdCloud Website/design_handoff_edcloud_site/content.js" with two mechanical fixes:
//   1. the shipped file redeclared `const press`, `const services` and `const results` and pushed the last two
//      logos twice (a SyntaxError, and 50 logos instead of 48) — the duplicate blocks are removed;
//   2. the one local logo (UC San Diego) was a PNG; it now sits with the others as /images/logos/uc-san-diego.webp.
// No string was retyped.
export const HOME = (() => {
const logos = [
      // Self-hosted. These were hot-linked from static.wixstatic.com until the Wix account was
      // closed; each is now a local WebP trimmed to its artwork (scripts/logos/trim-logos.py) at up
      // to 440px. w/h are the trimmed file's own size: the wall sizes every logo from its shape,
      // and the grid reserves space before the file arrives. Emerson Collective was listed twice;
      // the sharper of its two files is the one kept.
      { src: '/images/logos/desmos.webp', alt: 'Desmos', w: 363, h: 78 },
      { src: '/images/logos/clever.webp', alt: 'Clever', w: 382, h: 102 },
      { src: '/images/logos/first-round.webp', alt: 'First Round', w: 326, h: 326 },
      { src: '/images/logos/lausd.webp', alt: 'LAUSD', w: 436, h: 126 },
      { src: '/images/logos/project-wayfinder.webp', alt: 'Project Wayfinder', w: 348, h: 113 },
      { src: '/images/logos/reach-capital.webp', alt: 'Reach Capital', w: 393, h: 115 },
      { src: '/images/logos/tutorme.webp', alt: 'TutorMe', w: 424, h: 88 },
      { src: '/images/logos/green-dot.webp', alt: 'Green Dot', w: 310, h: 138 },
      { src: '/images/logos/edthena.webp', alt: 'Edthena', w: 177, h: 143 },
      { src: '/images/logos/amplify.webp', alt: 'Amplify', w: 336, h: 88 },
      { src: '/images/logos/wonderschool.webp', alt: 'Wonderschool', w: 427, h: 58 },
      { src: '/images/logos/uc-berkeley.webp', alt: 'UC Berkeley', w: 204, h: 123 },
      { src: '/images/logos/booknook.webp', alt: 'BookNook', w: 364, h: 55 },
      { src: '/images/logos/everfi.webp', alt: 'EVERFI', w: 281, h: 48 },
      { src: '/images/logos/cover.webp', alt: 'Cover', w: 214, h: 75 },
      { src: '/images/logos/tcsa.webp', alt: 'TCSA', w: 370, h: 259 },
      { src: '/images/logos/handshake.webp', alt: 'Handshake', w: 440, h: 70 },
      { src: '/images/logos/berkeley-city-college.webp', alt: 'Berkeley City College', w: 309, h: 168 },
      { src: '/images/logos/otherlab.webp', alt: 'Otherlab', w: 428, h: 129 },
      { src: '/images/logos/emerson-collective.webp', alt: 'Emerson Collective', w: 430, h: 114 },
      { src: '/images/logos/bullseye.webp', alt: 'Bullseye', w: 440, h: 219 },
      { src: '/images/logos/lindsay-leads.webp', alt: 'Lindsay Leads', w: 431, h: 118 },
      { src: '/images/logos/classavo.webp', alt: 'Classavo', w: 278, h: 54 },
      { src: '/images/logos/youth-radio.webp', alt: 'Youth Radio', w: 419, h: 205 },
      { src: '/images/logos/codehs.webp', alt: 'CodeHS', w: 398, h: 118 },
      { src: '/images/logos/hgp.webp', alt: 'HGP', w: 211, h: 105 },
      { src: '/images/logos/rethink-capital-management.webp', alt: 'Rethink Capital Management', w: 200, h: 85 },
      { src: '/images/logos/sfusd.webp', alt: 'SFUSD', w: 389, h: 410 },
      { src: '/images/logos/ousd.webp', alt: 'OUSD', w: 299, h: 80 },
      { src: '/images/logos/y-combinator.webp', alt: 'Y Combinator', w: 440, h: 157 },
      { src: '/images/logos/nyu.webp', alt: 'NYU', w: 423, h: 94 },
      { src: '/images/logos/sf-state.webp', alt: 'San Francisco State University', w: 205, h: 127 },
      { src: '/images/logos/pearson.webp', alt: 'Pearson', w: 393, h: 110 },
      { src: '/images/logos/cfund.webp', alt: 'CFund', w: 440, h: 205 },
      { src: '/images/logos/givecampus.webp', alt: 'GiveCampus', w: 288, h: 35 },
      { src: '/images/logos/stellic.webp', alt: 'Stellic', w: 354, h: 74 },
      { src: '/images/logos/virtual-internships.webp', alt: 'Virtual Internships', w: 420, h: 129 },
      { src: '/images/logos/breathe-for-change.webp', alt: 'Breathe For Change', w: 405, h: 440 },
      { src: '/images/logos/wiley.webp', alt: 'Wiley', w: 348, h: 79 },
      { src: '/images/logos/edvisorly.webp', alt: 'EdVisorly', w: 440, h: 83 },
      { src: '/images/logos/answersai-mobile.webp', alt: 'AnswersAi Mobile', w: 440, h: 84 },
      { src: '/images/logos/teachfx.webp', alt: 'TeachFX', w: 434, h: 90 },
      { src: '/images/logos/newschools-venture-fund.webp', alt: 'NewSchools Venture Fund', w: 360, h: 84 },
      { src: '/images/logos/lumi.webp', alt: 'Lumi', w: 213, h: 134 },
      { src: '/images/logos/marble.webp', alt: 'Marble', w: 440, h: 109 },
      { src: '/images/logos/worksheets-ai.webp', alt: 'Worksheets AI', w: 440, h: 440 },
      { src: '/images/logos/uc-san-diego.webp', alt: 'UC San Diego', w: 358, h: 440 },
      { src: '/images/logos/cal-state-east-bay.webp', alt: 'Cal State East Bay', w: 425, h: 159 }
    ];
    const press = [
      // Added after the handoff. Source, headline and date are taken from the article's own metadata
      // (og:title and article:published_time), not retyped from the page.
      { source: 'EdWeek Market Brief', date: 'Sep 2026', title: 'Lemnis, Public Charity Born From NWEA Sale, Makes First K-12 Acquisition', href: 'https://marketbrief.edweek.org/strategy-operations/lemnis-public-charity-born-from-nwea-sale-makes-first-k-12-acquisition/2026/09' },
      { source: 'Crunchbase News', date: 'Jul 2026', title: "Exclusive: EdVisorly Raises $13.3M Series A To Fix The Messy College Transfer Process With AI", href: 'https://news.crunchbase.com/venture/edtech-university-ai-platform-funding-edvisorly/' },
      { source: 'Fox Baltimore', date: 'Dec 2025', title: "Prince George's County Schools launches pilot with Colin Kaepernick's AI program Lumi", href: 'https://foxbaltimore.com/news/local/prince-georges-county-schools-colin-kaepernicks-ai-program-lumi-story-interim-superintendent-dr-shawn-joseph-county-executive-aisha-braveboy' },
      { source: 'Forbes', date: 'Oct 2025', title: 'Meet Marble: The Startup Helping Kids Get Therapy From Real Therapists, Not AI', href: 'https://www.forbes.com/sites/shimiteobialo/2025/10/14/meet-marble-the-startup-helping-kids-get-therapy-from-real-therapists-not-ai/' },
      { source: 'KVUE', date: 'May 2024', title: 'Austin ISD implements new yoga program for mental health', href: 'https://www.kvue.com/article/news/local/austin-isd-yoga-program-breathe-for-change-mental-health-relax/269-b7d0331f-9f5c-444d-ae89-c02cbac318f9' },
      { source: 'Built in SF', date: 'Jan 2020', title: "Now Valued at $3.5B, Handshake is Poised to Be Gen Z's Linkedin", href: 'https://www.builtinsf.com/articles/handshake-raises-200m-3b-valuation-hiring' },
      { source: 'The Times', date: 'Aug 2022', title: 'Long Unicorn Status in the Pipeline for Virtual Internships', href: 'https://www.thetimes.com/article/long-unicorn-status-in-the-pipeline-for-virtual-internships-xdrlk75v2' },
      { source: 'Higher Ed Dive', date: 'May 2022', title: 'Zovio Sells Tutoring Services Business Tutor Me for $55M', href: 'https://www.highereddive.com/news/zovio-sells-tutoring-services-business-for-55m/624320/' },
      { source: 'CISION', date: 'Jan 2022', title: 'Social Emotional and Life Readiness Provider Wayfinder Closes $6.6M Series A Round', href: 'https://www.prweb.com/releases/social-emotional-and-life-readiness-provider-wayfinder-closes-6-6-million-series-a-round-868041674.html' }
    ];
const capabilities = [
      ['Rapid Testing and Evolution', 'Find the parts of your product that K12 and higher ed buyers actually pay for, and prove it in market fast.'],
      ['Revenue Transformation', "Rebuild the revenue team end to end, from first outreach to renewal. Find and fix what's slowing you down."],
      ['Hypergrowth Strategy, Tactics, and Execution', 'A plan built on playbooks that already worked, then run alongside your team until it sticks.'],
      ['Scaling from Local to National', 'Turn a regional foothold into a national footprint with territory plans, channels, and procurement paths.'],
      ['Growth Team Training and Evaluation', 'Hire, coach, and empower the people who will carry your business to the next level.'],
      ['Fundraising and Capital Performance', 'Raise on the strength of a repeatable engine, and put the capital where it compounds.']
    ].map(([label, desc], i) => ({ n: String(i + 1).padStart(2, '0'), label, desc }));
    const services = [
      { n: '01', title: 'Nationwide Hypergrowth', body: 'From tiny local foothold to national market leader. Dramatically shortcut your sales and marketing learning curve while avoiding costly mistakes, and cut out years of wasted effort by putting our market-proven growth strategies to work.' },
      { n: '02', title: 'Ubiquitous Market Awareness', body: 'Don\'t just adopt the gold standard - become one. We have helped build some of the best-known education technology brands ever, from inception to ubiquity - and we can help your company go from "virtually unknown" to "virtually everywhere" faster and more reliably than anybody else.' },
      { n: '03', title: 'Supercharged Product Market Fit', body: 'We can\'t help you work harder - but we can help you move faster. Supercharge the core components of your value prop and PMF that resonate with K12 and higher education decision makers - focusing on the parts of your product that truly sell.' }
    ];
const cases = [
      { n: '01', stat: '$3.5B', statLabel: 'Handshake was last valued at over $3.5B.', title: 'Join Handshake. 520 Times', body: 'We helped the team at Handshake expand from an initial foothold of 30 universities to over 550 - building and executing one of the fastest and most successful higher education growth campaigns of all time.' },
      { n: '02', stat: '$3B', statLabel: 'Outschool was last valued at over $3B.', title: 'Outschool, Pandemic Mode', body: 'We started working with Outschool during the first month of the pandemic lockdowns, quickly helping their team build an enterprise sales operation and successfully adapt to a dramatically different K12 landscape.' },
      { n: '03', stat: '$100M', statLabel: 'Wayfinder was last valued at just under $100M.', title: 'Wayfinding from $0 to $15M ARR', body: 'We started working with the team at Wayfinder when they were doing less than $50k in sales. Today they are used by over a million students, and are the fastest growing SEL company in the United States.' },
      { n: '04', stat: '$500M', statLabel: 'Clever was acquired by Kahoot for $500M.', title: 'Get Clever. To 90% Market Share', body: 'We helped build the Clever K12 sales and marketing teams from the ground up, guiding the company from 10% to 90% market share in just under 2 years - the fastest K12 technology takeover ever.' }
    ];

  return { logos, press, capabilities, services, cases };
})();
export const SERVICES = (() => {
const proof = [
      { stat: '30 → 550', label: 'universities in two years', client: 'Handshake' },
      { stat: '10% → 90%', label: 'US market share in two years', client: 'Clever' },
      { stat: '300 → 1.5M', label: 'students using the curriculum', client: 'Wayfinder' },
      { stat: '500K', label: 'teachers served', client: 'Outschool' }
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
      { client: 'Wayfinder', start: 'Under $50k in sales', built: 'A national K12 sales motion for SEL', outcome: '$15M ARR; over a million students; last valued at just under $100M' },
      { client: 'Outschool', start: 'Month one of pandemic lockdowns', built: 'An enterprise sales operation for a changed K12 market', outcome: 'Last valued at over $3B' }
    ];
  return { proof, phases, services, results };
})();
