# Proofread report: batch C (`site-40` to `web-config-transform`)

19 articles read in full. 16 changed, 3 needed nothing (`site-40`, `spec-refinement`, `the-beginning`). Every rendered text change below is recorded in `docs/proofread/{slug}.json` and checked by the parity test. URLs and slugs are unchanged.

## 1. Title changes

| Article (slug, unchanged) | Old title | New title |
| --- | --- | --- |
| `site-redesign-the-rekoning` | Site Redesign - The Rekoning | Site Redesign - The Reckoning |
| `site-changes-and-seasons-greetings` | Site Changes and Seasons Greetings! | Site Changes and Season's Greetings! |

Description changes: `site-redesign-the-rekoning` ("learn't" to "learnt") and `the-tarantula-hawk` ("worlds" to "world's").

## 2. Per article

### site-40
No changes. No code.

### site-changes-and-seasons-greetings
| Before | After | Kind |
| --- | --- | --- |
| Site Changes and Seasons Greetings! (title) | Site Changes and Season's Greetings! | punctuation |
| I have neglected it all together | I have neglected it altogether | spelling |
| the user base in no where near | the user base is nowhere near | typo |

Code: none. The Google+ badge embed is untouched.

### site-redesign-the-rekoning
| Before | After | Kind |
| --- | --- | --- |
| Site Redesign - The Rekoning (title) | Site Redesign - The Reckoning | spelling |
| what I have learn't over (description) | what I have learnt over | spelling |
| old tosh creative's spent | old tosh creatives spent | punctuation |
| I have utilized my expanded | I have utilised my expanded | spelling |
| I love pre-compliers | I love pre-compilers | spelling |
| `&amp;:before {` (inside the second code sample) | `&:before {` | code |
| when people say the "know CSS3" | when people say they "know CSS3" | typo |
| I have utilized them pretty well | I have utilised them pretty well | spelling |
| was a simple as fixing | was as simple as fixing | typo |
| I suppose its cheating | I suppose it's cheating | punctuation |
| I going to admit now | I'm going to admit now | grammar |
| I going to redesign it | I'm going to redesign it | grammar |

Code: 2 raw `<pre>` blocks (inline-styled syntax colouring, all on one line) converted to fenced `less` blocks, split onto lines and indented with two spaces. Rendered text is identical apart from the logged double-escaping artefact, which showed readers `&amp;:before` instead of the LESS parent selector `&:before`. Inline code added: `@media print`, `hidden-print`, `:after`.

### site-update-3
| Before | After | Kind |
| --- | --- | --- |
| the sites blog controller | the site's blog controller | punctuation |
| optimization tweaks | optimisation tweaks | spelling |

Code: none.

### spanking-new-site
| Before | After | Kind |
| --- | --- | --- |
| a few other tech's | a few other techs | punctuation |
| get to tied down | get too tied down | spelling |
| a few bit and pieces | a few bits and pieces | typo |

Code: inline code added for `{controller}/{action}/{id}`.

### spec-refinement
No changes. No code.

### speed-up-your-pc
| Before | After | Kind |
| --- | --- | --- |
| initiative. if you're not sure | initiative. If you're not sure | typo |
| back-up before hand! | back-up beforehand! | spelling |
| other peoples guides | other people's guides | punctuation |
| at then end for reference | at the end for reference | typo |
| All to often | All too often | spelling |
| real-time detection.Keep | real-time detection. Keep | punctuation |
| which mean having to log back | which means having to log back | grammar |
| Windows will too.This guide | Windows will too. This guide | punctuation |
| to be sure lets run | to be sure let's run | punctuation |
| Easy sqeezy! | Easy squeezy! | spelling |
| defrag of you PC | defrag of your PC | typo |
| "defragment"or "optimize" | "defragment" or "optimize" | punctuation |
| log into Windows.This is like | log into Windows. This is like | punctuation |
| simple go back | simply go back | typo |
| deep now. the danger | deep now. The danger | typo |
| unless your a developer | unless you're a developer | grammar |
| a bit of a mine field | a bit of a minefield | spelling |
| bad-ass looking guys service | bad-ass looking guy's service | punctuation |
| Its tough to say | It's tough to say | punctuation |
| easier then you might think | easier than you might think | spelling |
| I adivse you | I advise you | spelling |
| buy an Solid State Drive | buy a Solid State Drive | grammar |
| I 'm afraid | I'm afraid | punctuation |
| SSD is rapid.You could | SSD is rapid. You could | punctuation |
| Any cload storage | Any cloud storage | spelling |
| along the left.Select | along the left. Select | punctuation |

Code: none. Commands such as "msconfig" and "services.msc" stay in their quotation marks, because backticking them would remove the quote characters readers see.

### ssas-attribute-key-cannot-be-found
| Before | After | Kind |
| --- | --- | --- |
| three assessment's that | three assessments that | punctuation |
| one specific warning lead me | one specific warning led me | spelling |
| could get passed this first value | could get past this first value | spelling |
| Go the "Dimension key errors" tab | Go to the "Dimension key errors" tab | typo |
| "Use custom error configuration ". | "Use custom error configuration". | punctuation |

Code: none. The three grey boxes are quoted error messages in styled `<div>`s, not code samples, so they stay as raw HTML.

### string-to-enum-net-40plus
| Before | After | Kind |
| --- | --- | --- |
| TryParse. if you Google | TryParse. If you Google | typo |

Code: 1 indented code block converted to a fenced `csharp` block. It had non-breaking-space indentation, trailing hard-break spaces and stray blank lines after opening braces, left over from the original paragraph-per-line HTML. It is now re-indented with four spaces, trailing spaces are trimmed and the stray blank lines after `{` are removed; rendered text is unchanged. The comment mentions `ProductOptions.Name` although the enum is `SortOptions`; that is a code inaccuracy, so it stays. Inline code added for `TryParse` in running text.

### svg-sprite-automation
| Before | After | Kind |
| --- | --- | --- |
| onto the page is batches | onto the page in batches | typo |
| unstiching | unstitching | spelling |
| au feit | au fait | spelling |
| perfect of high-resolution screens | perfect for high-resolution screens | typo |
| For those of use using | For those of us using | typo |
| let's get the to crux | let's get to the crux | typo |

Code: none (the Gist embed is untouched).

### testing-android-app-on-the-nexus-7-on-windows-81
| Before | After | Kind |
| --- | --- | --- |
| recognised my my PC | recognised by my PC | typo |

Code: none.

### thai-lime-ginger-and-prawn-stir-fry
| Before | After | Kind |
| --- | --- | --- |
| 3tbps Groundnut Oil | 3tbsp Groundnut Oil | typo |
| and wack them | and whack them | spelling |
| this recipes' conception | this recipe's conception | punctuation |

Code: none (the Instagram embed is untouched).

### the-beginning
No changes. No code.

### the-diamond-problem
| Before | After | Kind |
| --- | --- | --- |
| only on abstract class can be extended | only one abstract class can be extended | typo |
| bonaza | bonanza | spelling |
| overidden | overridden | spelling |

Code: none.

### the-tarantula-hawk
| Before | After | Kind |
| --- | --- | --- |
| one of the worlds most evil insects (description) | one of the world's most evil insects | punctuation |
| in one links comments | in one link's comments | punctuation |
| horrific in it's treatment | horrific in its treatment | punctuation |
| the worlds second most painful | the world's second most painful | punctuation |
| body to to either | body to either | typo |
| seal it in to it's excruciating | seal it in to its excruciating | punctuation |
| the spiders abdomen | the spider's abdomen | punctuation |
| the vicitim alive | the victim alive | spelling |
| emerging for the abdoment | emerging from the abdomen | typo |

Code: none (the YouTube iframe is untouched).

### time-to-design
| Before | After | Kind |
| --- | --- | --- |
| some ERD's to get | some ERDs to get | punctuation |

Code: none.

### trip-to-rotterdam
| Before | After | Kind |
| --- | --- | --- |
| Amstel on draft | Amstel on draught | spelling |
| bottled Grolsh | bottled Grolsch | spelling |
| several plaza's | several plazas | punctuation |
| helpful , this stood | helpful, this stood | punctuation |

Code: none.

### uml-design
| Before | After | Kind |
| --- | --- | --- |
| This has lead me | This has led me | spelling |

Code: none.

### web-config-transform
| Before | After | Kind |
| --- | --- | --- |
| much exposure too is | much exposure to is | spelling |
| it's common practice (start of paragraph) | It's common practice | typo |
| the in's and outs | the ins and outs | punctuation |

Code: inline code added for `Web.config` in running text. The quotation from Sayed Ibrahim Hashimi is left exactly as quoted (including "standardized").

## 3. Not changed, owner to decide

| Article | Text | Why left |
| --- | --- | --- |
| site-40 | "from many learning working professionally with Umbraco" | Garbled, but the intended wording isn't certain. |
| site-40 | "Github" | Product name capitalisation (GitHub); product names are left alone. |
| spec-refinement | "the first meeting with the Sabisu" | Possibly a stray "the", but could be deliberate. |
| spec-refinement | "feature definement" | Not standard English ("definition"), but it reads as the author's choice. |
| site-update-3 | "there isn't much in date stuff on the web" | Probably "up-to-date", but that is a rewording. |
| spanking-new-site | "I didn't feel it insighted a lot of thought" | Not a word; probably "incited" but could be "inspired". |
| spanking-new-site | "the bad habits I picked of doing SQL" | Missing word ("picked up"), and the sentence would still need rewording. |
| string-to-enum-net-40plus | "Intellisense in VS 2013 shows to very useful method" | Clearly wrong, but could be "a very useful method" or "two very useful methods". |
| speed-up-your-pc | "CCCleaner" / "CC Cleaner" | The product is "CCleaner"; product names are left alone. |
| speed-up-your-pc | "Disk clean, really just deletes necessary files" | Almost certainly "unnecessary", but that changes the meaning. |
| speed-up-your-pc | "then hit run it by hitting", "simply go back, and add enable it", "that may necessarily not make a big difference" | Each fix needs a choice of wording. |
| speed-up-your-pc | "Defragment and Optimize", "optimize" | Quoted Windows UI labels, so the American spelling stays. |
| ssas-attribute-key-cannot-be-found | "lo behold", "the problem lied with", "I alluded this meant" | Idiom or word choice ("lo and behold", "lay", "deduced"); fixing them would be rewording. |
| thai-lime-ginger-and-prawn-stir-fry | "You should be liken to an Octopus" | Probably "like an Octopus", but needs rewording. |
| the-diamond-problem | "must implement all classes given in the interface" | Technically "methods", but that is a factual change. |
| the-tarantula-hawk | "hairy eight legged insects", "The Tarantula Wasp" (title says Hawk) | Factual or naming points, not typos. |
| trip-to-rotterdam | "We formally woke up", "do so much right in, the country", "as we stopped a gentle roll" | Unclear intended wording. |
| trip-to-rotterdam | Link `/umbraco/www.resturantasher.nl` | Broken relative link (missing `http://`). Not in the spec's list of fixable links, so left. |
| web-config-transform | Indented attribution line under the quote, and the split `<span>H</span>anselman` | Raw HTML left as converted; rendered text is already correct. |
| site-redesign-the-rekoning | "## Design" followed by a long run of non-breaking spaces | Left so the heading renders exactly as live. |

## 4. Counts

- Articles read: 19. Articles touched: 16 (16 JSON files).
- Rendered text changes: 83 (2 title, 2 description, 79 body).
- By kind: punctuation 29, spelling 27, typo 21, grammar 5, code 1.
- Code blocks: 3 converted to fenced blocks (2 `less` from raw `<pre>`, 1 `csharp` from an indented block). No raw `<pre>` and no tab characters remain in the batch.
- Inline code added (Markdown only, no rendered text change): 7 spans in 4 articles.
- Links and images: none changed. Neither `known-broken.json` entry named in the spec belongs to this batch.
