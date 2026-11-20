---
title: "teaching a football app what a player actually does."
description: "Player archetypes, a very questionable Yamal replacement, and the engineering behind Football Intelligence."
date: 2026-10-24
topic: "building · football analytics"
draft: false
---

Calling Toni Kroos and N'Golo Kanté “midfielders” is technically correct. It also tells you almost nothing about why you would sign either of them.

That gap is what I wanted to build around. Football Intelligence takes match events and turns them into playing styles, tactical context and recruitment options. You can find a player, see what makes them useful, and ask who else could do that job. Then open the result and see how the app got there.

The project grew into a warehouse of 11.7 million events, a player analysis engine, and a squad explorer covering 96 clubs across Europe's top five leagues. I built the data ingestion, the scoring logic, the API and the web app. But the interesting parts were the moments where the maths worked and the football didn't.

<figure class="football-figure"><a href="https://footballintelligencesystem.vercel.app" target="_blank" rel="noopener"><img src="/projects/football.png" alt="Football Intelligence, the recruitment app built around player analysis and squad alternatives" width="1265" height="712" /></a><figcaption>The finished front door. The interesting stuff starts when you open a player. <a href="https://footballintelligencesystem.vercel.app" target="_blank" rel="noopener">Try the app ↗</a></figcaption></figure>

## giving players a football identity

A stats page can tell you someone completes a lot of passes. I wanted it to explain what kind of player that adds up to.

I built a catalogue of 17 playing styles across forwards, midfielders, defenders and goalkeepers. Each style has a recipe. A deep-lying playmaker scores on moving the ball forward, reaching the final third, completing passes and keeping those passes accurate under pressure. A ball-winning midfielder is judged on recoveries, duels, defensive actions and pressing.

The inputs are percentiles, so each stat describes where a player stands against comparable players. Normally that means the same provider, competition, season and broad position, with at least 900 minutes played. A score of 90 means a stat ranks around the top tenth of that group. It is not a prediction that the player will succeed 90% of the time.

Then the recipe takes a weighted average. Progressive passing counts twice as much as passing under pressure in the playmaker profile. Every weight is visible in the code. That made the system easy to inspect when it said something strange, which it absolutely did.

<figure class="analysis-sheet recipe-sheet" aria-label="Interactive midfielder archetype recipes"><div class="sheet-heading"><span>THE MIDFIELD RECIPES</span><span>4 of 17 archetypes</span></div><div class="recipe-layout"><div class="recipe-menu" role="group" aria-label="Choose an archetype"><button type="button" data-recipe="playmaker" aria-pressed="true"><span>01</span> Deep-lying playmaker</button><button type="button" data-recipe="winner" aria-pressed="false"><span>02</span> Ball-winning midfielder</button><button type="button" data-recipe="carrier" aria-pressed="false"><span>03</span> Box-to-box carrier</button><button type="button" data-recipe="attacker" aria-pressed="false"><span>04</span> Attacking midfielder</button></div><div class="recipe-working" aria-live="polite"><div class="recipe-bars"><div><span>Progressive passes</span><i style="--weight:100%"></i><b>2.0</b></div><div><span>Final-third entries</span><i style="--weight:75%"></i><b>1.5</b></div><div><span>Pass completion</span><i style="--weight:75%"></i><b>1.5</b></div><div><span>Passing under pressure</span><i style="--weight:50%"></i><b>1.0</b></div></div><p class="recipe-note">Move it forward. Keep it. Do both when someone is closing you down.</p></div></div><div class="sheet-foot">Player's percentile × each weight → add them up → divide by available weight</div><figcaption>Actual weights from the scoring engine. Select a role to see what changes.</figcaption></figure>

A player can fit more than one style. The engine keeps a secondary profile if it scores at least 65, and calls the result blended when the two leading scores are less than five points apart. That matters for someone like Pogba, whose recorded result was box-to-box carrier with attacking midfielder as his secondary profile. Picking one label and throwing the rest away would lose the useful bit.

This also became a way to search. Instead of knowing a name already, you can ask for ball-playing defenders or ball-winning midfielders and work backwards from the job you need done.

## then it called kanté a playmaker

In validation, Kanté's 2017/18 Wyscout profile came back as a deep-lying playmaker. His ball-winning profile was second, at 77. If you watch football, that is a result you stop and look at.

The problem was upstream. Wyscout's open data does not record pressures or recoveries. Two of the things that help explain Kanté were missing from the input. The engine was choosing between the styles it could measure, but the page was presenting the winner as though it had considered everything.

I changed how the assessment handles missing evidence. A style needs at least two available metrics and half of its total weight before it can be scored. The result also explains which styles could not be assessed. If an otherwise clear winner has unassessed alternatives, the label becomes “limited by provider data”.

That does not magically fix Kanté's input. It fixes what the product claims to know about him.

<figure class="analysis-sheet case-sheet"><div class="sheet-heading"><span>FROM THE VALIDATION NOTES</span><span>01 OCT 2026</span></div><div class="case-tabs" role="group" aria-label="Recorded player assessments"><button type="button" data-case="kante" aria-pressed="true">Kanté</button><button type="button" data-case="kroos" aria-pressed="false">Kroos</button><button type="button" data-case="pogba" aria-pressed="false">Pogba</button><button type="button" data-case="messi" aria-pressed="false">Messi</button></div><div class="case-body" aria-live="polite"><p class="case-season">2017/18 · Wyscout · midfielder</p><h3 class="case-name">N'Golo Kanté</h3><div class="case-verdict"><span class="case-primary">Deep-lying playmaker</span><span class="case-status">Limited by provider data</span></div><p class="case-secondary">Secondary: ball-winning midfielder · 77</p><div class="case-evidence"><span>WHAT THE RESULT NEEDS YOU TO KNOW</span><p>Pressures and recoveries are missing from this source. The winning label describes the available evidence, not every part of his game.</p></div></div><figcaption>Recorded outputs from real player profiles. These are historical validation results, not live ratings.</figcaption></figure>

Kroos's 2015/16 profile came back as a deep-lying playmaker with a fit of 96. Messi's 2017/18 profile was a creative attacker with a blended assessment. Those are useful sanity checks, but recognising a famous player is only the start. Kanté's result taught me more about the system than a label that looked right immediately.

## an upgrade at doing what, exactly?

The current-season squad tool started with a fairly reasonable idea: find similar players, then rank the ones with better numbers.

The first version gave Yamal eight possible upgrades. One was a midfielder with no goals. Clearances and long-ball accuracy were making up for the things you would actually want from a replacement for Yamal.

Every stat had an equal vote. That was the bug in the reasoning.

I changed the comparison so a stat matters more when it is already a strength of the selected player. If you are replacing a winger who creates chances and beats defenders, the replacement should be judged heavily on those things. Weaker areas still count, but they cannot take over the whole decision.

<figure class="analysis-sheet weight-sheet"><div class="sheet-heading"><span>WHAT COUNTS AS AN UPGRADE?</span><span>The weighting fix</span></div><div class="weight-switch" role="group" aria-label="Comparison weighting"><button type="button" data-weight="equal" aria-pressed="false">First version</button><button type="button" data-weight="strength" aria-pressed="true">Revised version</button></div><div class="weight-chart" aria-live="polite"><div><span>Existing strength <small>90th percentile</small></span><div class="weight-track"><i class="weight-strong" style="width:85%"></i></div><b class="weight-strong-value">0.85</b></div><div><span>Average area <small>50th percentile</small></span><div class="weight-track"><i class="weight-average" style="width:25%"></i></div><b class="weight-average-value">0.25</b></div><div><span>Weaker area <small>20th percentile</small></span><div class="weight-track"><i class="weight-weak" style="width:25%"></i></div><b class="weight-weak-value">0.25</b></div></div><p class="weight-explanation">The strength gets 3.4 times the weight. Other areas still count.</p><div class="revision-result"><span>Yamal's recorded upgrade list</span><strong><s>8</s> → 1</strong><span>Olise remained, at +3.5.</span></div><figcaption>The bars demonstrate the actual formula with illustrative percentiles, not Yamal's individual stats. The 8 → 1 result is from the project's validation run.</figcaption></figure>

I also removed noisy percentages, such as an impressive completion rate built on almost no attempts, and excluded team-dependent stats and discipline from the comparison. Candidates stay within the same role family, need 180 minutes and at least ten shared stats. An upgrade must be at least 60% similar and improve the weighted score by at least three points.

After that change, Yamal's list went from eight to one: Olise, with a +3.5 difference in that recorded run. The page still shows what the candidate is worse at. And when there is no convincing upgrade, it says so. Bellingham and Rodri both returned none in validation.

This is a comparison of the available season numbers. It cannot promise that a transfer would work. But it is a much better starting point than “this player has a bigger average”.

## the player is only half the picture

A midfielder can look brilliant in one side and disappear in another. So I added a view of how the player fits into the team around them.

The engine summarises a squad along four axes: keeping the ball, progressing it, pressing and winning it, and creating chances. Players with more minutes contribute more to that team profile. Then it compares the selected player with the squad. A gap of ten points or more highlights where they add something, or where their teammates carry more of the load.

It is a compact way to ask a useful question: are we buying more of what we already have, or something we are missing?

The historical recruitment search has 16 role briefs, separate from the 17 descriptive archetypes. An archetype says what the player does. A brief says what you are looking for. Results combine 60% style similarity with 40% role fit, with both scores shown separately. A candidate can look like your reference and still be a poor answer to the brief.

All of that feeds into a written scouting report: playing style, strengths, questions, team context and role fit. The report is assembled from the evidence on the profile, and shortlists keep the rationale alongside the candidate. You should not have to reconstruct your reasoning every time you open the app.

## making eleven million events usable

The intelligence layer only works if the records underneath it mean what you think they mean. StatsBomb and Wyscout use different event names, coordinates and ways of recording what happened. I built adapters to bring those into a common structure while keeping the source attached.

One validation bug made defensive duels zero or missing for everyone. The query was looking for “defensive”, while one source called the event “Tackle” and the other used “Ground defending duel”. Another hid Wyscout goals because they were stored as a tag. Neither would have been obvious from a pretty dashboard.

Original provider files are saved with checksums. Imports resume from match checkpoints, and replaying an import should not duplicate the events. In the recorded Wyscout replay check, the database stayed at 3,071,392 events and 1,826 matches. Malformed coordinates were quarantined with a reason instead of quietly becoming dots on a pitch.

The same person can also appear under different provider records. I added a person layer so those records can live under one profile, without adding their event totals together. Changing the season re-scopes the maps, peers, report and tactical context together. Messi's profile exposed why that mattered: the development chart initially lost 23 of 24 seasons because their start dates were missing. Deriving dates from season labels brought the history back.

## the page should not have to read the whole database

PostgreSQL holds the organised events. dbt prepares the player-season stats and percentiles before anyone opens a profile. FastAPI serves the analysis, and Next.js handles the interface. A request for similar players ranks peers for that player rather than building every possible player-to-player comparison.

I measured the database-backed endpoints locally. The spatial summary was the obvious slow one: a median of 481.80 milliseconds. Adding an index for the player spatial query brought that to 22.62 milliseconds, about 21 times faster in that benchmark.

<figure class="analysis-sheet timing-sheet"><div class="sheet-heading"><span>PLAYER SPATIAL SUMMARY</span><span>Median HTTP response</span></div><div class="timing-row"><span>Before index</span><div><i style="width:100%"></i></div><b>481.80 ms</b></div><div class="timing-row"><span>After index</span><div><i style="width:4.695%"></i></div><b>22.62 ms</b></div><div class="query-note"><span>Inside PostgreSQL</span><strong>Index-only scan</strong><p>2,863 player events read · 37 heap fetches · 1.825 ms query time</p></div><figcaption>25 requests per endpoint on localhost, against 10.8 million events, 29 September 2026. Database query time is separate from HTTP response time. These are development measurements, not production latency claims.</figcaption></figure>

Hosting added a different constraint. The local database was roughly 7 GB, mostly raw events. I precomputed each player-season's heatmap, pass map, shot map and threat zones into spatial snapshots, so the hosted app could serve those without carrying the whole raw archive. The hosted database was about 200 MB in the documented build.

The app runs on Vercel, with FastAPI on Render and PostgreSQL on Neon. The snapshots need rebuilding when the source changes, but that trade keeps the expensive work out of the page request.

## what made this worth building

There are parts of the project that are easy to show in a screenshot: the pitch maps, the squad explorer, the side-by-side comparisons. The work I am happier with is underneath them. Knowing why a label appeared. Catching a ranking that rewards the wrong thing. Making a season change update the whole analysis instead of one chart.

I also tested a valuation model that improved on a simple baseline, then did not ship it as a valuation. Its supposed 80% interval only covered 47% of the real values. Better average error was not enough to make the uncertainty useful.

That is where the project got interesting for me. Getting an answer onto the screen was one problem. Figuring out when it deserved to be there was a much bigger one.

<p class="football-source-note">Figures and player examples come from the project's implementation and dated validation records. The 11.7 million event total is the later README snapshot; performance measurements used the earlier 10.8 million event warehouse. Historical event coverage and current-season squad data are separate. <a href="https://footballintelligencesystem.vercel.app" target="_blank" rel="noopener">Explore Football Intelligence ↗</a></p>
