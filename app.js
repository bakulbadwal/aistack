"use strict";
/*
 * The AI Stack — render + interaction layer.
 * All content lives in data.json; this file renders it into the DOM
 * defined in index.html, then wires up every interactive feature.
 */
(function () {
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  fetch("data.json")
    .then(function (r) {
      if (!r.ok) throw new Error("data.json fetch failed: " + r.status);
      return r.json();
    })
    .then(function (data) {
      renderMeta(data.meta);
      renderLayers(data.layers);
      renderLayerNavigator(data.layers);
      renderStackHero(data.layers);
      renderSide(data);
      renderBenchConcepts(data.concepts);
      wireInteractive(data);
      wireBench();
      initReveals();
    })
    .catch(function (err) {
      var w = document.querySelector(".wrap");
      if (w) {
        var box = document.createElement("div");
        box.style.cssText = "margin:20px 0;padding:16px;border:1px solid #9C5B3B;border-radius:3px;color:#D08A63";
        box.textContent = "Couldn't load data.json (" + err.message + "). If you opened this file directly (file://), serve it from a local static server instead — fetch() of local JSON is blocked by the browser otherwise. Try: python3 -m http.server, then open http://localhost:8000/.";
        w.prepend(box);
      }
      console.error(err);
    });

  /* ---------- Meta stat line ---------- */
  function renderMeta(meta) {
    var el = document.getElementById("metaLine");
    if (!el || !meta) return;
    el.innerHTML =
      "<span>As of <b>" + esc(meta.asOf) + "</b></span>" +
      (meta.cadence ? "<span><b style=\"color:var(--gold-bright)\">" + esc(meta.cadence) + "</b></span>" : "") +
      "<span>Inference now <b>" + esc(meta.inferenceShare) + "</b></span>" +
      "<span>AI funding <b>" + esc(meta.fundingTTM) + "</b></span>" +
      "<span class=\"rep\" style=\"color:var(--paper-dim)\">" + esc(meta.note) + "</span>";
  }

  /* ---------- Layers ---------- */
  function renderLayers(layers) {
    var root = document.getElementById("layersRoot");
    if (!root) return;
    root.innerHTML = layers
      .map(function (layer, index) {
        return (
          '<section class="layer" id="atlas-layer-' + index + '" data-lnum="' + esc(layer.lnum) + '" data-lname="' + esc(layer.lname) + '">' +
          '<div class="lhead">' +
          '<div class="lnum">' + esc(layer.lnum) + "</div>" +
          '<div class="lname">' + layer.lname + "</div>" +
          '<div class="ldesc">' + layer.ldesc + "</div>" +
          "</div>" +
          '<div class="lbody">' +
          renderEcon(layer.econ) +
          layer.groups.map(renderGroup).join("") +
          "</div>" +
          "</section>"
        );
      })
      .join("");
  }

  function plainText(markup) {
    var el = document.createElement("div");
    el.innerHTML = markup;
    return el.textContent || el.innerText || "";
  }

  function renderLayerNavigator(layers) {
    var nav = document.getElementById("layerNavigator");
    if (!nav) return;
    nav.innerHTML = layers
      .map(function (layer, index) {
        return (
          '<a class="layer-jump" href="#atlas-layer-' + index + '">' +
          '<span class="layer-jump-num">' + esc(layer.lnum) + "</span>" +
          '<span class="layer-jump-name">' + esc(plainText(layer.lname)) + "</span>" +
          '<span class="layer-jump-arrow" aria-hidden="true">↓</span>' +
          "</a>"
        );
      })
      .join("");
  }

  /* Isometric CSS stack hero — the seven layers as clickable slabs.
     Accent colors come from --accL1..--accL7 via :nth-child, same as the cards. */
  function renderStackHero(layers) {
    var stage = document.getElementById("stackHero");
    if (!stage) return;
    var n = layers.length;
    stage.innerHTML =
      '<div class="stack3d">' +
      layers
        .map(function (layer, i) {
          var num = esc(layer.lnum.split("·")[0].trim());
          var name = esc(plainText(layer.lname));
          return (
            '<a class="slab" href="#atlas-layer-' + i + '" style="--i:' + i + ";--n:" + n + '" aria-label="' + num + " — " + name + '">' +
            '<span class="slab-face" aria-hidden="true"></span>' +
            '<span class="slab-tag"><b>' + num + "</b> " + name + "</span>" +
            "</a>"
          );
        })
        .join("") +
      "</div>";
    var scene = stage.querySelector(".stack3d");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        scene.classList.add("built");
      });
    });
  }

  /* Scroll-in reveals; skipped entirely under prefers-reduced-motion */
  function initReveals() {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var els = document.querySelectorAll(".layer, .binstr, .cols .card, .wrap > .card, .yousit, .atlas-heading, .layer-nav");
    els.forEach(function (el) {
      el.classList.add("reveal");
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
    /* Safety net: if reveals can't fire (hidden tab, IO quirk), show everything */
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
      });
    }, 1500);
  }

  function renderEcon(rows) {
    return (
      '<details class="econ"><summary>How money works here</summary><div class="econrows">' +
      rows
        .map(function (row) {
          return (
            '<div class="erow' + (row.thesis ? " thesis" : "") + '">' +
            '<span class="ek">' + row.k + "</span>" +
            '<span class="ev">' + row.v + "</span>" +
            "</div>"
          );
        })
        .join("") +
      "</div></details>"
    );
  }

  function renderGroup(grp) {
    var attrs = "";
    if (grp.cap) attrs += ' data-cap="' + grp.cap + '"';
    if (grp.pe) attrs += ' data-pe="' + esc(grp.pe) + '"';
    return (
      '<div class="grp"' + attrs + '>' +
      '<p class="gtitle">' + grp.title + "</p>" +
      '<div class="tiles">' +
      grp.tiles.map(renderTile).join("") +
      "</div>" +
      "</div>"
    );
  }

  function renderTile(tile) {
    var cls = "tile" + (tile.lab ? " lab" : "");
    var pubAttr = "";
    if (tile.pub === true) pubAttr = " data-pub";
    else if (tile.pub === "filed") pubAttr = ' data-pub="filed"';
    var tgCls = "tg" + (tile.muted ? " muted" : "");
    return (
      '<div class="' + cls + '"' + pubAttr + '>' +
      '<div class="nm">' + esc(tile.nm) + "</div>" +
      '<div class="' + tgCls + '">' + tile.tg + "</div>" +
      "</div>"
    );
  }

  /* ---------- Side content (M&A flow, reading rules, corners, footer) ---------- */
  function renderSide(data) {
    var mna = document.getElementById("mnaFlowList");
    if (mna) {
      mna.innerHTML = data.mnaFlow
        .map(function (item) {
          return '<li><span class="d mono">' + esc(item.d) + "</span><span class=\"t\">" + item.t + "</span></li>";
        })
        .join("");
    }
    var rules = document.getElementById("readingRulesList");
    if (rules) {
      rules.innerHTML = data.readingRules
        .map(function (r) {
          return '<li><span class="d mono">' + esc(r.tag) + "</span><span class=\"t\">" + r.t + "</span></li>";
        })
        .join("");
    }
    var corners = document.getElementById("cornersText");
    if (corners) corners.innerHTML = data.corners;
    var footer = document.getElementById("footerText");
    if (footer) footer.innerHTML = data.footer;
  }

  /* ---------- Interactive: tile index, onboarding, search, drawer, lenses, traces, quiz ---------- */
  function wireInteractive(data) {
    var PROFILES = data.profiles,
      TRACES = data.traces,
      LENS_NOTES = data.lensNotes,
      QUIZ = data.quiz;

    var tileIndex = {};
    document.querySelectorAll(".tile").forEach(function (tile) {
      var nm = tile.querySelector(".nm");
      if (!nm) return;
      var key = nm.textContent.trim();
      (tileIndex[key] = tileIndex[key] || []).push(tile);
    });

    /* Onboarding hint */
    (function () {
      var onboard = document.getElementById("onboardHint");
      if (!onboard) return;
      var seen = false;
      try {
        seen = localStorage.getItem("aistack_onboarded") === "1";
      } catch (e) {}
      if (seen) {
        onboard.style.display = "none";
        return;
      }
      var closeBtn = document.getElementById("onboardClose");
      closeBtn.addEventListener("click", function () {
        onboard.style.display = "none";
        try {
          localStorage.setItem("aistack_onboarded", "1");
        } catch (e) {}
      });
    })();

    /* Search */
    (function () {
      var input = document.getElementById("companySearch");
      var count = document.getElementById("searchCount");
      if (!input) return;
      var allTiles = document.querySelectorAll(".tile");
      input.placeholder = "Search " + allTiles.length + " entities";
      function apply() {
        var q = input.value.trim().toLowerCase();
        if (!q) {
          allTiles.forEach(function (t) {
            t.classList.remove("search-hit", "search-dim");
          });
          count.textContent = "";
          return;
        }
        var hits = 0;
        allTiles.forEach(function (t) {
          var nm = t.querySelector(".nm");
          var isMatch = !!(nm && nm.textContent.trim().toLowerCase().indexOf(q) !== -1);
          t.classList.toggle("search-hit", isMatch);
          t.classList.toggle("search-dim", !isMatch);
          if (isMatch) hits++;
        });
        count.textContent = hits + (hits === 1 ? " match" : " matches");
      }
      input.addEventListener("input", apply);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          input.value = "";
          apply();
          input.blur();
        }
      });
    })();

    function layerNameFor(el) {
      var layer = el.closest(".layer");
      if (!layer) return "";
      var num = layer.querySelector(".lnum"),
        name = layer.querySelector(".lname");
      return (num ? num.textContent.trim() : "") + " — " + (name ? name.textContent.trim() : "");
    }

    /* Drawer */
    var drawer = document.getElementById("drawer"),
      scrim = document.getElementById("scrim"),
      dBody = document.getElementById("drawerBody");

    function row(k, v) {
      return '<div class="drow"><span class="dk">' + k + "</span><span class=\"dv\">" + v + "</span></div>";
    }
    function openDrawer(name, tile) {
      var p = PROFILES[name];
      var tagEl = tile.querySelector(".tg");
      var html = '<p class="dlayer">' + esc(layerNameFor(tile)) + "</p>";
      html += '<h2 class="serif">' + esc(name) + "</h2>";
      if (p) {
        html += '<div class="dtag">' + p.tag + "</div>";
        html += row("What it sells", p.sells);
        html += row("Who buys", p.buyers);
        html += row("Business model", p.model);
        html += row("Depends on (below)", p.down);
        html += row("Moat", p.moat);
        html += '<div class="drow dkill"><span class="dk">What kills it</span><span class="dv">' + p.kill + "</span></div>";
      } else {
        html += '<div class="dtag">' + (tagEl ? esc(tagEl.textContent.trim()) : "") + "</div>";
        html +=
          '<p class="dfall">No deep profile in v2 — about twenty representative names are profiled, one or two per group, so the atlas teaches patterns instead of trying to be a database. The layer’s <b style="color:var(--gold-bright)">“How money works here”</b> bar above this tile carries most of what transfers: the margins, the moat type, and who’s squeezing whom apply to this company too.</p>';
      }
      dBody.innerHTML = html;
      drawer.classList.add("open");
      scrim.classList.add("open");
    }
    function closeDrawer() {
      drawer.classList.remove("open");
      scrim.classList.remove("open");
    }
    document.querySelectorAll(".tile").forEach(function (tile) {
      tile.addEventListener("click", function () {
        var nm = tile.querySelector(".nm");
        if (nm) openDrawer(nm.textContent.trim(), tile);
      });
    });
    document.getElementById("drawerClose").addEventListener("click", closeDrawer);
    scrim.addEventListener("click", closeDrawer);

    /* Lenses */
    var lensNote = document.getElementById("lensNote");
    var lensBtns = document.querySelectorAll(".lensbtn");
    lensBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        lensBtns.forEach(function (b) {
          b.classList.remove("on");
        });
        btn.classList.add("on");
        document.body.classList.remove("lens-cap", "lens-pub", "lens-pe");
        var lens = btn.getAttribute("data-lens");
        if (lens !== "none") {
          document.body.classList.add("lens-" + lens);
          lensNote.innerHTML = LENS_NOTES[lens];
          lensNote.style.display = "block";
          if (lens === "pe") {
            var extras = [];
            document.querySelectorAll(".grp[data-pe]").forEach(function (g) {
              var t = g.querySelector(".gtitle");
              extras.push("<b>" + (t ? t.textContent.trim() : "") + "</b>: " + esc(g.getAttribute("data-pe")));
            });
            lensNote.innerHTML += "<br><br>" + extras.join("<br>");
          }
        } else {
          lensNote.style.display = "none";
        }
      });
    });

    /* Traces */
    var tracePanel = document.getElementById("tracePanel");
    var trBtns = document.querySelectorAll(".trbtn");
    var activeTrace = null;

    function clearTrace() {
      document.body.classList.remove("tracing");
      document.querySelectorAll(".tile.hot").forEach(function (t) {
        t.classList.remove("hot");
        t.removeAttribute("data-step");
      });
      tracePanel.style.display = "none";
      trBtns.forEach(function (b) {
        b.classList.remove("on");
      });
      activeTrace = null;
    }

    trBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-trace");
        if (activeTrace === key) {
          clearTrace();
          return;
        }
        clearTrace();
        activeTrace = key;
        btn.classList.add("on");
        var tr = TRACES[key];
        document.body.classList.add("tracing");
        var html = "<b>" + tr.title + "</b><div style='margin-top:8px'>";
        tr.steps.forEach(function (step, i) {
          var tiles = tileIndex[step[0]] || [];
          tiles.forEach(function (t) {
            t.classList.add("hot");
            t.setAttribute("data-step", i + 1);
          });
          html += "<div class='tstep'><span class='tn'>" + (i + 1) + "</span><span class='tc'><b>" + esc(step[0]) + "</b> — <i>" + step[1] + "</i></span></div>";
        });
        html += "</div><div class='moral'>" + tr.moral + "</div>";
        tracePanel.innerHTML = html;
        tracePanel.style.display = "block";
        tracePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });

    /* Quiz */
    var quizModal = document.getElementById("quizModal"),
      qNum = document.getElementById("qNum"),
      qQ = document.getElementById("qQ"),
      qA = document.getElementById("qA"),
      qOrder = QUIZ.map(function (_, i) {
        return i;
      }),
      qPos = 0;

    function shuffle(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)),
          tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
    }
    function showCard() {
      var idx = qOrder[qPos];
      qNum.textContent = "Card " + (qPos + 1) + " of " + QUIZ.length;
      qQ.textContent = QUIZ[idx][0];
      qA.textContent = QUIZ[idx][1];
      qA.classList.remove("show");
    }
    document.getElementById("quizBtn").addEventListener("click", function () {
      quizModal.classList.add("open");
      showCard();
    });
    document.getElementById("quizClose").addEventListener("click", function () {
      quizModal.classList.remove("open");
    });
    document.getElementById("qReveal").addEventListener("click", function () {
      qA.classList.add("show");
    });
    document.getElementById("qNext").addEventListener("click", function () {
      qPos = (qPos + 1) % QUIZ.length;
      showCard();
    });
    document.getElementById("qShuffle").addEventListener("click", function () {
      shuffle(qOrder);
      qPos = 0;
      showCard();
    });

    /* Esc closes everything */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeDrawer();
        quizModal.classList.remove("open");
        if (activeTrace) clearTrace();
      }
    });
  }

  /* ---------- Operator's Bench: Concepts Deck (data-driven) ---------- */
  function renderBenchConcepts(concepts) {
    var box = document.getElementById("fcards");
    if (!box) return;
    box.innerHTML = concepts
      .map(function (c, i) {
        return (
          '<div class="fcard" data-i="' + i + '"><div class="ft">' + c.t + "</div><div class=\"fs\">" + c.s +
          ' · click to flip</div><div class="fb">' + c.b + '<span class="fr">Remember: ' + c.r +
          '</span><span class="fq">' + c.q + "</span></div></div>"
        );
      })
      .join("");
    box.querySelectorAll(".fcard").forEach(function (el) {
      el.addEventListener("click", function () {
        el.classList.toggle("open");
      });
    });
  }

  /* ---------- Operator's Bench: Token Meter + Adapt-or-Build (pure calculators, no content) ---------- */
  function wireBench() {
    var $ = function (id) {
      return document.getElementById(id);
    };
    var fmt$ = function (n) {
      if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
      if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
      if (n >= 1) return "$" + n.toFixed(2);
      return (n * 100).toFixed(1) + "¢";
    };

    /* Token Meter — "Your AI Bill" (personal usage) */
    var TM_CLASSES = [
      ["Frontier", 8],
      ["Mid-tier", 1.5],
      ["Small / open", 0.4],
    ];
    var tmClass = 0;
    // [label, default tokTask in K, hint]
    var TM_TASKS = [
      ["Quick question", 1.5, "~1–2K tokens · a Slack-message-sized ask"],
      ["Study / homework help", 6, "~5–8K tokens · a few back-and-forth turns"],
      ["Long coding session", 35, "~20–50K tokens · a real debugging or build session"],
      ["Read a big PDF / CIM", 100, "~50–150K tokens · drop in a document and ask questions"],
      ["Full research thread", 180, "~150–200K tokens · a long multi-turn deep dive"],
    ];
    var TM_SLIDERS = [
      { id: "tokTask", l: "Tokens for this task (K)", min: 0.5, max: 500, v: 6, st: 0.5, u: function (v) { return v >= 1 ? v + "K" : Math.round(v * 1000) + " tok"; } },
      { id: "freq", l: "How often per month", min: 1, max: 1000, v: 20, st: 1, u: function (v) { return v + "×/mo"; } },
      { id: "sub", l: "Your subscription / mo ($) — $20 Plus/Pro · $100–200 Max", min: 0, max: 200, v: 20, st: 5, u: function (v) { return v === 0 ? "none" : "$" + v; } },
    ];
    var tmLocal = 0; // 0 = already own capable hardware, 1 = would need to buy/rent
    var TM_LOCAL = [
      ["I own capable hardware", 0],
      ["I'd need to buy or rent", 2000 / 36],
    ];
    function tmV(id) {
      var s = TM_SLIDERS.find(function (x) {
        return x.id === id;
      });
      return s.cur !== undefined ? s.cur : s.v;
    }
    function tmRenderControls() {
      $("tmTasks").innerHTML = TM_TASKS.map(function (t, i) {
        return '<button class="btn" data-tt="' + i + '" title="' + t[2] + '">' + t[0] + "</button>";
      }).join("");
      $("tmTasks").querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          var s = TM_SLIDERS.find(function (x) { return x.id === "tokTask"; });
          s.cur = TM_TASKS[+b.getAttribute("data-tt")][1];
          tmRenderControls();
          tmUpd();
        });
      });
      $("tmClass").innerHTML = TM_CLASSES.map(function (c, i) {
        return '<button class="btn' + (i === tmClass ? " on" : "") + '" data-tc="' + i + '">' + c[0] + " · $" + c[1] + "/M</button>";
      }).join("");
      $("tmClass").querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          tmClass = +b.getAttribute("data-tc");
          tmRenderControls();
          tmUpd();
        });
      });
      $("tmLocal").innerHTML = TM_LOCAL.map(function (t, i) {
        return '<button class="btn' + (i === tmLocal ? " on" : "") + '" data-tl="' + i + '">' + t[0] + "</button>";
      }).join("");
      $("tmLocal").querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          tmLocal = +b.getAttribute("data-tl");
          tmRenderControls();
          tmUpd();
        });
      });
      var box = $("tmSliders");
      box.innerHTML = "";
      TM_SLIDERS.forEach(function (s) {
        var d = document.createElement("div");
        d.className = "bsl";
        d.innerHTML = '<div class="bl"><span>' + s.l + '</span><b id="tmv_' + s.id + '"></b></div>';
        var r = document.createElement("input");
        r.type = "range";
        r.min = s.min;
        r.max = s.max;
        r.step = s.st || 1;
        r.value = s.cur !== undefined ? s.cur : s.v;
        r.addEventListener("input", function () {
          s.cur = +r.value;
          tmUpd();
        });
        d.appendChild(r);
        box.appendChild(d);
      });
    }
    function tmUpd() {
      var apiPM = TM_CLASSES[tmClass][1];
      var tokTask = tmV("tokTask"),
        freq = tmV("freq"),
        sub = tmV("sub");
      TM_SLIDERS.forEach(function (s) {
        var el = $("tmv_" + s.id);
        if (el) el.textContent = s.u(s.cur !== undefined ? s.cur : s.v);
      });
      var costQuery = (tokTask * apiPM) / 1000;      // $ per single use
      var costMonth = costQuery * freq;               // $ API cost per month
      var apiPM2 = apiPM * 0.6;                        // 1yr-out deflation (~-40%/yr)
      var costMonthNext = ((tokTask * apiPM2) / 1000) * freq;
      var localMonth = TM_LOCAL[tmLocal][1];          // ~$0 if owned, amortized if bought

      $("tmCost").textContent = fmt$(costQuery);
      $("tmMonth").textContent = fmt$(costMonth);

      var verdict, vColor;
      if (sub === 0) {
        verdict = "Pay-as-you-go";
        vColor = "var(--paper)";
      } else if (costMonth < sub * 0.5) {
        verdict = "Overpaying by " + fmt$(sub - costMonth) + "/mo";
        vColor = "var(--flag-bright)";
      } else if (costMonth > sub * 1.3) {
        verdict = "Subscription wins by " + fmt$(costMonth - sub) + "/mo";
        vColor = "var(--gold-bright)";
      } else {
        verdict = "About a wash";
        vColor = "var(--paper)";
      }
      $("tmVerdict").textContent = verdict;
      $("tmVerdict").style.color = vColor;

      var bar = function (l, pct, val, col) {
        return '<div class="bbarrow"><span class="lbl">' + l + '</span><div class="trk"><i style="width:' + Math.max(0, Math.min(100, pct)) + "%;background:" + (col || "var(--gold)") + '"></i></div><span class="val">' + val + "</span></div>";
      };
      var mx = Math.max(costMonth, sub, localMonth, costMonthNext) || 1;
      var localVal = localMonth < 0.5 ? "~$0" : fmt$(localMonth);
      $("tmBars").innerHTML =
        bar("API pay-as-you-go / mo", (costMonth / mx) * 100, fmt$(costMonth)) +
        (sub > 0 ? bar("Your subscription / mo", (sub / mx) * 100, "$" + sub, "var(--hl-bright)") : "") +
        bar("Run it locally / mo ○", (localMonth / mx) * 100, localVal, "var(--gold-dim)") +
        '<div style="height:8px"></div>' +
        bar("API / mo — in 1 year ○", (costMonthNext / mx) * 100, fmt$(costMonthNext), "var(--flag-bright)");

      var notes = [];
      if (sub > 0 && costMonth < sub * 0.5)
        notes.push('<div class="bnote warn"><b>You\'re paying for convenience, not tokens.</b> At this volume the raw API would run you ' + fmt$(costMonth) + "/mo — under half your " + fmt$(sub) + " subscription. The flat rate is buying you no bill-shock and no metering anxiety, which is a fine trade if you value not thinking about it — just know that's what you\'re buying, not a cheaper token.</div>");
      if (sub > 0 && costMonth > sub * 1.3)
        notes.push('<div class="bnote good"><b>Your subscription is doing real work.</b> At this volume the API would cost ' + fmt$(costMonth) + "/mo — more than you pay. Whoever eats that spread (the lab) is betting your usage stays this heavy or grows: the same subsidize-to-lock-in logic as the whole subscription layer of this map, now working in your favor.</div>");
      notes.push('<div class="bnote"><b>The deflation tailwind is yours too:</b> token prices have fallen ~40%/yr ○ — the same query that costs ' + fmt$(costQuery) + " today should run about " + fmt$(costQuery * 0.6) + ' in a year on the same tier. \"Just wait\" is a real strategy for anything that isn\'t urgent — and it\'s why picking the right model tier beats optimizing prompt length.</div>');
      notes.push('<div class="bnote"><b>Model tier is the biggest lever you control.</b> Running this exact task on Mid-tier or Small/open instead of Frontier cuts the API cost <b>5–20×</b> — often for a real but small quality loss on easy work. That\'s the "routing" idea from Layer 06, applied to your own bill.</div>');
      if (tmLocal === 0) {
        notes.push('<div class="bnote"><b>On hardware you already own, marginal cost is ≈ $0</b> (just electricity) — a Mac with unified memory or a PC with a strong GPU. The catch: you\'re capped to Small/open-weight-tier models at ~15–40 tok/s ○, slower and less capable than frontier API access. The real reason to run local usually isn\'t cost — it\'s keeping proprietary or sensitive data off someone else\'s servers entirely (the "sovereign AI" argument, at personal scale).</div>');
        notes.push('<div class="bnote"><b>What can your machine actually run?</b> Rough rule of thumb ○, 4-bit quantized: <b>~8GB → 7–8B · 16GB → 13B · 24GB → 32B · 48GB+ → 70B</b>. A browser can\'t read your RAM or VRAM, so to match a model to your exact specs use <a href="https://llmfitcheck.com/" target="_blank" rel="noopener" style="color:var(--hl-bright)">LLM Fit Check ↗</a> (covers Apple unified memory) or <a href="https://lmstudio.ai/" target="_blank" rel="noopener" style="color:var(--hl-bright)">LM Studio ↗</a>, which detects your hardware and filters to models you can run.</div>');
      }
      else
        notes.push('<div class="bnote"><b>A capable machine is a real upfront cost</b> — a Mac with enough unified memory or a PC with a strong GPU runs ~$1,500–3,000+, about ' + fmt$(localMonth) + '/mo over three years — and still caps you to open-weight-tier quality ○. The other path is renting GPUs from a neocloud (Lambda, Crusoe, RunPod, CoreWeave), but that\'s mostly an enterprise move: at personal volumes you pay for idle GPU time and rarely beat the API. <i>Note: buying tokens through a hyperscaler like AWS Bedrock or Google Vertex is still per-token pricing — that\'s the "API" line above, not renting compute. Where compute rental actually lives is Layer 02 of the map.</i></div>');
      notes.push('<div class="bnote">○ These numbers are directional (July 2026) and the 40%/yr deflation figure is a thesis — this meter teaches the <i>shape</i>, not a precise bill. For an accurate, continuously-updated figure, use a dedicated calculator like <a href="https://pricepertoken.com/subscription-calculator" target="_blank" rel="noopener" style="color:var(--hl-bright)">Price Per Token\'s subscription-vs-API tool ↗</a>, or <a href="https://openrouter.ai/models" target="_blank" rel="noopener" style="color:var(--hl-bright)">OpenRouter ↗</a> for raw per-token rates. The durable part: per-token cost keeps falling, subscriptions are a bet on your volume, and tier choice matters more than token-counting.</div>');
      $("tmNotes").innerHTML = notes.join("");
    }

    /* Adapt or Build */
    var AC_QS = [
      { k: "know", l: "What does it need to know?", o: ["Public knowledge only", "Our documents / wiki", "Live systems & data"] },
      { k: "beh", l: "How it should behave", o: ["Default behavior is fine", "House style & format matter", "Strict / regulated output"] },
      { k: "shape", l: "Shape of the task", o: ["Single-shot answers", "Multi-step, uses tools"] },
      { k: "scale", l: "Volume & cost pressure", o: ["Prototype / low volume", "High volume, cost-sensitive"] },
    ];
    var acSel = { know: 0, beh: 0, shape: 0, scale: 0 };
    function acRender() {
      $("acQs").innerHTML = AC_QS.map(function (q) {
        return (
          '<div class="qrow"><div class="qlab">' + q.l + '</div><div class="bseg">' +
          q.o
            .map(function (o, i) {
              return '<button class="btn' + (acSel[q.k] === i ? " on" : "") + '" data-k="' + q.k + '" data-i="' + i + '">' + o + "</button>";
            })
            .join("") +
          "</div></div>"
        );
      }).join("");
      $("acQs").querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          acSel[b.getAttribute("data-k")] = +b.getAttribute("data-i");
          acRender();
          acUpd();
        });
      });
    }
    function acUpd() {
      var s = acSel,
        stack = ["Prompting — always the floor; version prompts like code"],
        cx = 1;
      if (s.know === 1) {
        stack.push("RAG — retrieve from your docs at query time, answer with citations");
        cx++;
      }
      if (s.know === 2) {
        stack.push("Tool calls / connectors (MCP) — pull live data instead of memorizing it");
        cx++;
      }
      if (s.beh === 1) stack.push("Few-shot examples in the prompt — cheapest way to buy style");
      if (s.beh === 2) {
        stack.push("Fine-tune (LoRA) — train the format in; behavior, never facts");
        cx++;
      }
      if (s.shape === 1) {
        stack.push("Agent loop — plan → act → check, with tools and memory");
        cx++;
      }
      if (s.scale === 1) {
        stack.push("Route + distill — small model for the easy 80%, cache aggressively");
        cx++;
      }
      var primary = s.shape === 1 ? "Agent" : s.beh === 2 ? "Fine-tune" : s.know > 0 ? "RAG" : "Prompting";
      var FAIL = {
        Prompting: "<b>Failure mode:</b> prompt drift — a model update silently changes behavior. Keep an eval set and version prompts like code.",
        RAG: "<b>Failure mode:</b> garbage retrieval in, confident garbage out. The retrieval pipeline (chunking, recall, freshness) IS the product — the model just narrates what it's handed.",
        "Fine-tune": "<b>Failure mode:</b> you taught it style, not truth. Fine-tuning to inject facts produces confident hallucination — pair it with RAG for anything factual.",
        Agent: "<b>Failure mode:</b> reliability compounds per step — 95% a step is 36% over twenty steps. Without evals and checkpoints you have a demo, not a product.",
      };
      var DONT = {
        Prompting: "Don't reach for fine-tuning because prompting feels unsophisticated — cheapest lever first is the discipline.",
        RAG: "Don't fine-tune to teach the model your wiki — that's the classic expensive mistake this chooser exists to prevent.",
        "Fine-tune": "Don't fine-tune the frontier model if a small open model + your data matches quality at a tenth the serving cost.",
        Agent: "Don't agent-ify a workflow a deterministic script does better — agents are for genuinely branching work.",
      };
      $("acOut").innerHTML =
        '<div class="bnote good" style="margin-top:0"><b>Recommended stack — lead with ' + primary + ":</b><br>" + stack.map(function (x) { return "› " + x; }).join("<br>") + "</div>" +
        '<div class="bnote">' + FAIL[primary] + "</div>" +
        '<div class="bnote warn"><b>Don\'t:</b> ' + DONT[primary] + "</div>" +
        '<div class="bnote">Complexity: <b>' + (cx <= 2 ? "low — a good week" : cx <= 4 ? "medium — a quarter and a real pipeline" : "high — this is a platform, staff it like one") + "</b> · The rule under all of it: need it to <b>know</b> → RAG. Need it to <b>behave</b> → fine-tune. Most problems are the first kind.</div>";
    }

    tmRenderControls();
    tmUpd();
    acRender();
    acUpd();
  }
})();
