---
title: Overview
layout: default.njk
datum: 03.05.2025
---

<style>

  /* http://meyerweb.com/eric/tools/css/reset/ 
   v2.0 | 20110126
   License: none (public domain)
*/

html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
	display: block;
}
body {
	line-height: 1;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}

body{
  background-color: #666;
  font-family: sans-serif;
}

*{
  color: #fff !important;
}

h1{
  font-size: 5em;
}

h2{
  font-size: 3em;
  font-weight: bold;
  color: #444 !important;
}

main{
  padding: 20px;
}

section, header{
  margin-bottom: 5em;
}


.overview{
  display: grid;
  grid-template-columns: repeat( auto-fit, minmax(200px, 1fr) );
  gap: 10px;
}

.img-wrap{
  width: 200px;
  height: 200px;
  background-color: #333;
  overflow: hidden;
  border-radius: 4px;
}

img{
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
}

figure{
  margin: 0;
  padding: 0;
}

figcaption{
  padding-top: 10px;
  margin-bottom: 1em;
}

table th{
  text-align: left;
  max-width: 300px;
}

th, td{
  border-top: solid 1px #aaa;
}

</style>

<main>

<header>
  <h1>Cranach Artefacts Dev Demo</h1>
  <h2><date>{{ datum }} </date/></h2>
</header>

  <section>
<h2>Paintings</h2>

<ul class="overview">
{%- for item in collections.paintingsDE -%}
  <li class="overview-item">
  <a href="de/{{item.metadata.id}}">
    <figure>
      <div class="img-wrap">
        <img src="{{item.metadata.imgSrc}}">
      </div>
      <figcaption>{{item.metadata.title}}<br>{{item.metadata.id}}<br>{{item.sortingInfo.year}}-{{item.sortingInfo.position}}</figcaption>
    </figure>
  </a>
  </li>
{%- endfor -%}
</ul>
</section>

<section>
<h2 id="drawings">Drawings</h2>

<ul class="overview">
{%- for item in collections.drawingsDE -%}
  <li class="overview-item">
  <a href="de/{{item.metadata.id}}">
    <figure>
      <div class="img-wrap">
        <img src="{{item.metadata.imgSrc}}">
      </div>
      <figcaption>{{item.metadata.title}}<br>{{item.metadata.id}}<br>{{item.sortingInfo.year}}-{{item.sortingInfo.position}}</figcaption>
    </figure>
  </a>
  </li>
{%- endfor -%}
</ul>
</section>

<section>
<h2 id="graphics">Graphics</h2>

<ul class="overview">
{%- for item in collections.graphicsVirtualObjectsDE -%}
  <li class="overview-item">
  <a href="de/{{item.metadata.id}}">
    <figure>
      <div class="img-wrap">
        <img src="{{item.metadata.imgSrc}}">
      </div>
      <figcaption>{{item.metadata.title}}<br>{{item.metadata.id}}<br>{{item.sortingNumber}}</figcaption>
    </figure>
  </a>
  </li>
{%- endfor -%}
</ul>
</section>

<section>
<h2 id="archivals">Archivals</h2>

<ul class="overview">
{%- for item in collections.archivalsDE -%}
  <li class="overview-item">
  <a href="de/{{item.metadata.id}}">
    <figure>
      <div class="img-wrap">
        <img src="{{item.metadata.imgSrc}}">
      </div>
      <figcaption>{{item.metadata.title}}<br>{{item.metadata.id}}<br>{{item.sortingNumber}}</figcaption>
    </figure>
  </a>
  </li>
{%- endfor -%}
</ul>
</section>

<section>
<h2>Literature</h2>

<table>
{%- for item in collections.literatureDE -%}
  <tr>
    <td><a href="de/literature-{{item.referenceId}}">{{item.shortTitle}}</a></td>
    <td>{{item.persons}}</td>
    <td>{{item.publishLocation}}</td>
    <td>{{item.date}}</td>
    <th>{{item.metadata.title}}</th>
  </tr>
{%- endfor -%}
</table>

<table>
{%- for item in collections.authorsDE -%}
  <tr>
    <td><a href="de/{{item.id}}">{{item.metadata.title}}</a></td>
  </tr>
{%- endfor -%}
</table>
</section>
</main>
