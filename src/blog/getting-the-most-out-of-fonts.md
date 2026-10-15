---
title: "Getting the most out of fonts"
description: "How to minify your fonts to get the best performance out of your site"
date: 2018-11-18T21:02:27
topic: Guide
tags: []
---

I'm sure that plenty has been written on the minification of fonts, but it's something I thought I would write about given my learnings over the last few years.

## System Fonts

If you can, choose system fonts. You will never have to worry about terms like _FOIT_ or _FOUT_ or take any hit on performance at all! Of course, that isn't always possible as typography plays a big part in the readability of a web page. However, should you be able to shirk the responsibilities of design, you can use system fonts.

-   Serif: "Apple Garamond", "Baskerville", "Times New Roman", "Droid Serif", "Times","Source Serif Pro", serif;
-   Mono: "SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace;

The above comes from this [CSS Tricks article.](https://css-tricks.com/snippets/css/system-font-stack/) Of course, it's possible to stray from these families - if you're into your typography; you can check out this [opinionated article](https://practicaltypography.com/system-fonts.html) for a graded list of fonts you can use.

## Source

Next steps if you're wanting custom fonts is choosing the source. If you can use a free font, [Google Fonts](https://fonts.google.com/) is a solid source. It gives you all the code you need, and will correctly load fonts with minimal impact on performance. Furthermore, if you're using a popular font, you can take comfort in the fact there is a chance a visitor may already have that cached.

I've not used many font providers, but I did find [Adobe Typekit](https://fonts.adobe.com/) wasn't that great. Using their scripts, I frequently noticed FOIT - especially when testing on slow connections. I will generally request the TTF formats of fonts when I get given fonts from Adobe, in favour of hosting them via our own CDN.

## Format

If you opt to host fonts yourself (there is nothing wrong with this), you need to get the right formats. I will always opt for TTF, because I can use build tools to create the other formats I need which I will touch on soon. TTF is what I call a "source" font, in the fact it is bigger than other formats. This is a last ditch effort to cover older browsers with your font. In order of the formats I load, I use the following:

1.  woff2 (30% smaller than TTF<sup><a href="#1">[1]</a></sup>)
2.  woff
3.  ttf

I won't bother with OTF or SVG as the above cover all browsers. You can then use `font-face` to get the fonts to load in that order.

<p>
<script src="https://gist.github.com/SvenPam/033c4f5ad7777b873d409555944380fc.js"></script>
</p>

## Minification

I spoke about opting for TTF fonts before, and now it's time for the reason - **build tools**. I'll be showing a way to do it with Gulp and then Webpack, but it will more than likely be possible to do it with other tools as well. There are two bits to this; formatting (as above) and filtering - that is removing the characters from font we are not going to use. This is really important as you're likely creating a site that's only going to be in your language. For example, English isn't going to need Cyrillic or Japanese characters. This alone can reduce some fonts to a third of the size! If you need to support multiple character sets, check out my tricks below.

#### Gulp

To do this in Gulp you will need to install the following:

-   [Gulp Fontmin](https://www.npmjs.com/package/gulp-fontmin)
-   [ttf2woff2](https://www.npmjs.com/package/ttf2woff2)

Fontmin does most of the work, it sadly just doesn't do Woff2. You can then write the following script to take a "source" TTF font, and convert it as part of your build.

<p>
<script src="https://gist.github.com/SvenPam/78b9c4fd7faa241346d586873b83f3c8.js"></script>
</p>

#### Webpack/Node

Using the original Fontmin, you can do the same as above. You will need:

-   [Fontmin](https://www.npmjs.com/package/fontmin)

<p>
<script src="https://gist.github.com/SvenPam/32c3d43012bae2e26014ae5e6d5d9ed6.js"></script>
</p>

### Tricks

Here are some tricks to help get a little more out of your fonts.

#### Inline Fonts

When you strip back your character set and use woff2, you should find a very small file. I like to utilise this further and inline the woff2 font as base64 in my CSS. There are loads of tools for this, I use the [post-](https://www.npmjs.com/package/postcss-inline-base64)css [inline base-64 library](https://www.npmjs.com/package/postcss-inline-base64). I wouldn't go crazy with this, but if you know you have some non-system fonts above the fold, this will ensure your font renders with your CSS.

#### Preload

You can preload fonts in your HTML and this can occur before the CSS is rendered. You can still use `@font-face` as normal.

`<link rel="preload" href="/fonts/chinchilla.woff2" as="font">`

#### Unicode Range Selector

You can expand on the build tools above, and break your fonts into multiple character sets. Once you have this, you can use the CSS unicode [range descriptor](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range). This descriptor goes into your `font-face` options and allows you to tell the browser what font-set matches a particular Unicode range. The _browser_ will then decide if it needs that based on the characters it has in its document.

#### Font Display

If you're having issues with FOIT, FOUT or FOFT you can use [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) to attempt to lessen the impact. This allows you to tell the browser how it should deal with the font.

#### Local Directive

When using `@font-face`, you don't just have to use `url()`. If you want a browser to try and get a font you think the system might have before it goes off into the web to get one, you can use `local()`. It's rare that you would want a specific font over a custom one, but it's just one extra tool to help you speed that font load up.

## More Reading

I'm by no means an expert. Fonts are complicated, even more so if you get on the topic of typography! If you're interested in reading more, here are some resources that helped me:

-   [CSS Tricks - FOUT, FOIT, FOFT](https://css-tricks.com/fout-foit-foft/)
-   [Google Web Font Optimization](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/webfont-optimization)

## Citation

<ol>
<li id="1"><a href="https://www.w3.org/TR/WOFF20ER/#continue">https://www.w3.org/TR/WOFF20ER/#continue</a></li>
</ol>
