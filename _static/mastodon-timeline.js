/**
 * Mastodon embed feed timeline v3.8.1
 * More info at:
 * https://gitlab.com/idotj/mastodon-embed-feed-timeline
 */

/**
 * Timeline settings
 * Adjust these parameters to customize your timeline
 */
window.addEventListener("load", () => {
  let mapi = new MastodonApi({
    // Id of the <div> containing the timeline
    container_body_id: "mt-body",

    // Preferred color theme: 'light', 'dark' or 'auto'. Default: auto
    default_theme: "auto",

    // Your Mastodon instance
    instance_url: "https://mastodon.social",

    // Choose type of toots to show in the timeline: 'local', 'profile', 'hashtag'. Default: local
    timeline_type: "profile",

    // Your user ID on Mastodon instance. Leave empty if you didn't choose 'profile' as type of timeline
    // @geographika@mastodon.social - https://mastodon-userid-lookup.jcxldn.net/
    user_id: "110781228437524388",

    // Your user name on Mastodon instance. Leave empty if you didn't choose 'profile' as type of timeline
    profile_name: "@geographika",

    // The name of the hashtag. Leave empty if you didn't choose 'hashtag' as type of timeline
    hashtag_name: "",

    // Maximum amount of toots to get. Default: 20
    toots_limit: "5",

    // Hide unlisted toots. Default: don't hide
    hide_unlisted: false,

    // Hide boosted toots. Default: don't hide
    hide_reblog: false,

    // Hide replies toots. Default: don't hide
    hide_replies: true,

    // Hide preview card if toot contains a link, photo or video from a URL. Default: don't hide
    hide_preview_link: false,

    // Converts Markdown symbol ">" at the beginning of a paragraph into a blockquote HTML tag (default: don't apply)
    markdown_blockquote: false,

    // Limit the text content to a maximum number of lines. Default: 0 (unlimited)
    text_max_lines: "0",

    // Customize the text of the link pointing to the Mastodon page (appears after the last toot)
    link_see_more: "See more...",
  });
});

/**
 * Set all variables with customized values or use default ones
 * @param {object} params_ User customized values
 * Trigger color theme function
 * Trigger main function to build the timeline
 */
const MastodonApi = function (params_) {
  this.DEFAULT_THEME = params_.default_theme || "auto";
  this.INSTANCE_URL = params_.instance_url;
  this.USER_ID = params_.user_id || "";
  this.PROFILE_NAME = this.USER_ID ? params_.profile_name : "";
  this.TIMELINE_TYPE = params_.timeline_type || "local";
  this.HASHTAG_NAME = params_.hashtag_name || "";
  this.TOOTS_LIMIT = params_.toots_limit || "20";
  this.HIDE_UNLISTED =
    typeof params_.hide_unlisted !== "undefined"
      ? params_.hide_unlisted
      : false;
  this.HIDE_REBLOG =
    typeof params_.hide_reblog !== "undefined" ? params_.hide_reblog : false;
  this.HIDE_REPLIES =
    typeof params_.hide_replies !== "undefined" ? params_.hide_replies : false;
  this.HIDE_PREVIEW_LINK =
    typeof params_.hide_preview_link !== "undefined"
      ? params_.hide_preview_link
      : false;
  this.MARKDOWN_BLOCKQUOTE =
    typeof params_.markdown_blockquote !== "undefined"
      ? params_.markdown_blockquote
      : false;
  this.TEXT_MAX_LINES = params_.text_max_lines || "0";
  this.LINK_SEE_MORE = params_.link_see_more;

  this.mtBodyContainer = document.getElementById(params_.container_body_id);

  this.setTheme();

  this.buildTimeline();
};

/**
 * Set the theme style choosen by user or browser/OS
 */
MastodonApi.prototype.setTheme = function () {
  /**
   * Set the theme value in the <html> tag using the attribute "data-theme"
   * @param {string} theme Type of theme to apply: dark or light
   */
  const setTheme = function (theme) {
    document.documentElement.setAttribute("data-theme", theme);
  };

  if (this.DEFAULT_THEME === "auto") {
    let systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    systemTheme.matches ? setTheme("dark") : setTheme("light");
    // Update the theme if user change browser/OS preference
    systemTheme.addEventListener("change", (e) => {
      e.matches ? setTheme("dark") : setTheme("light");
    });
  } else {
    setTheme(this.DEFAULT_THEME);
  }
};

/**
 * Listing toots function
 */
MastodonApi.prototype.buildTimeline = function () {
  let mapi = this;
  let requestURL = "";

  // Get request
  if (this.TIMELINE_TYPE === "profile") {
    requestURL = `${this.INSTANCE_URL}/api/v1/accounts/${this.USER_ID}/statuses?limit=${this.TOOTS_LIMIT}`;
  } else if (this.TIMELINE_TYPE === "hashtag") {
    requestURL = `${this.INSTANCE_URL}/api/v1/timelines/tag/${this.HASHTAG_NAME}?limit=${this.TOOTS_LIMIT}`;
  } else if (this.TIMELINE_TYPE === "local") {
    requestURL = `${this.INSTANCE_URL}/api/v1/timelines/public?local=true&limit=${this.TOOTS_LIMIT}`;
  }

  fetch(requestURL, {
    method: "get",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else if (response.status === 404) {
        throw new Error("404 Not found", { cause: response });
      } else {
        throw new Error(response.status);
      }
    })
    .then((jsonData) => {
      // console.log("jsonData: ", jsonData);

      // Empty the <div> container
      this.mtBodyContainer.innerHTML = "";

      for (let i in jsonData) {
        // First filter (Public / Unlisted)
        if (
          jsonData[i].visibility == "public" ||
          (!this.HIDE_UNLISTED && jsonData[i].visibility == "unlisted")
        ) {
          // Second filter (Reblog / Replies)
          if (
            (mapi.HIDE_REBLOG && jsonData[i].reblog) ||
            (mapi.HIDE_REPLIES && jsonData[i].in_reply_to_id)
          ) {
            // Nothing here (Don't append toots)
          } else {
            // Format and append toots
            appendToot.call(mapi, jsonData[i], Number(i));
          }
        }
      }

      // Check if there are toots in the container (due to filters applied)
      if (this.mtBodyContainer.innerHTML === "") {
        this.mtBodyContainer.setAttribute("role", "none");
        this.mtBodyContainer.innerHTML =
          '<div class="mt-error"><span class="mt-error-icon">📭</span><br/><strong>Sorry, no toots to show</strong><br/><div class="mt-error-message">Got ' +
          jsonData.length +
          ' toots from the server but due to the "hide filters" applied, no toot is shown</div></div>';
      } else {
        // Insert link after last toot to visit Mastodon page
        if (mapi.LINK_SEE_MORE) {
          let linkSeeMorePath = "";
          if (this.TIMELINE_TYPE === "profile") {
            linkSeeMorePath = mapi.PROFILE_NAME;
          } else if (this.TIMELINE_TYPE === "hashtag") {
            linkSeeMorePath = "tags/" + this.HASHTAG_NAME;
          } else if (this.TIMELINE_TYPE === "local") {
            linkSeeMorePath = "public/local";
          }
          let linkSeeMore =
            '<div class="mt-footer"><a href="' +
            mapi.INSTANCE_URL +
            "/" +
            linkSeeMorePath +
            '" class="btn" target="_blank" rel="nofollow noopener noreferrer">' +
            mapi.LINK_SEE_MORE +
            "</a></div>";
          this.mtBodyContainer.parentNode.insertAdjacentHTML(
            "beforeend",
            linkSeeMore
          );
        }
      }
    })
    .catch((err) => {
      this.mtBodyContainer.innerHTML =
        '<div class="mt-error"><span class="mt-error-icon">❌</span><br/><strong>Sorry, request failed:</strong><br/><div class="mt-error-message">' +
        err +
        "</div></div>";
      this.mtBodyContainer.setAttribute("role", "none");
    });

  /**
   * Inner function to add each toot in timeline container
   * @param {object} c Toot content
   * @param {number} i Index of toot
   */
  const appendToot = function (c, i) {
    this.mtBodyContainer.insertAdjacentHTML(
      "beforeend",
      this.assambleToot(c, i)
    );
  };

  // Toot interactions
  this.mtBodyContainer.addEventListener("click", function (e) {
    // Check if toot cointainer was clicked
    if (
      e.target.localName == "article" ||
      e.target.offsetParent.localName == "article" ||
      e.target.localName == "img"
    ) {
      openTootURL(e);
    }
    // Check if Show More/Less button was clicked
    if (
      e.target.localName == "button" &&
      e.target.className == "spoiler-link"
    ) {
      toogleSpoiler(e);
    }
  });
  this.mtBodyContainer.addEventListener("keydown", function (e) {
    // Check if Enter key was pressed with focus in an article
    if (e.key === "Enter" && e.target.localName == "article") {
      openTootURL(e);
    }
  });

  /**
   * Open toot in a new page avoiding any other natural link
   * @param {event} e User interaction trigger
   */
  const openTootURL = function (e) {
    let urlToot = e.target.closest(".mt-toot").dataset.location;
    if (
      e.target.localName !== "a" &&
      e.target.localName !== "span" &&
      e.target.localName !== "button" &&
      e.target.parentNode.className !== "toot-preview-image" &&
      urlToot
    ) {
      window.open(urlToot, "_blank");
    }
  };

  /**
   * Spoiler button
   * @param {event} e User interaction trigger
   */
  const toogleSpoiler = function (e) {
    const nextSibling = e.target.nextSibling;
    if (nextSibling.localName === "img") {
      e.target.parentNode.classList.remove("toot-media-spoiler");
      e.target.style.display = "none";
    } else if (
      nextSibling.classList.contains("spoiler-text-hidden") ||
      nextSibling.classList.contains("spoiler-text-visible")
    ) {
      if (e.target.textContent == "Show more") {
        nextSibling.classList.remove("spoiler-text-hidden");
        nextSibling.classList.add("spoiler-text-visible");
        e.target.setAttribute("aria-expanded", "true");
        e.target.textContent = "Show less";
      } else {
        nextSibling.classList.remove("spoiler-text-visible");
        nextSibling.classList.add("spoiler-text-hidden");
        e.target.setAttribute("aria-expanded", "false");
        e.target.textContent = "Show more";
      }
    }
  };
};

/**
 * Build toot structure
 * @param {object} c Toot content
 * @param {number} i Index of toot
 */
MastodonApi.prototype.assambleToot = function (c, i) {
  let avatar, user, content, url, date;

  if (c.reblog) {
    // BOOSTED toot
    // Toot url
    url = c.reblog.url;

    // Boosted avatar
    avatar =
      '<a href="' +
      c.reblog.account.url +
      '" class="mt-avatar mt-avatar-boosted" style="background-image:url(' +
      c.reblog.account.avatar +
      ');" rel="nofollow noopener noreferrer" target="_blank">' +
      '<div class="mt-avatar mt-avatar-booster" style="background-image:url(' +
      c.account.avatar +
      ');">' +
      "</div>" +
      '<span class="visually-hidden">' +
      c.account.username +
      " avatar" +
      "</span>" +
      "</a>";

    // User name and url
    user =
      '<div class="mt-user">' +
      '<a href="' +
      c.reblog.account.url +
      '" rel="nofollow noopener noreferrer" target="_blank">' +
      c.reblog.account.username +
      '<span class="visually-hidden"> post</span>' +
      "</a>" +
      "</div>";

    // Date
    date = this.formatDate(c.reblog.created_at);
  } else {
    // STANDARD toot
    // Toot url
    url = c.url;

    // Avatar
    avatar =
      '<a href="' +
      c.account.url +
      '" class="mt-avatar" style="background-image:url(' +
      c.account.avatar +
      ');" rel="nofollow noopener noreferrer" target="_blank">' +
      '<span class="visually-hidden">' +
      c.account.username +
      " avatar" +
      "</span>" +
      "</a>";

    // User name and url
    user =
      '<div class="mt-user">' +
      '<a href="' +
      c.account.url +
      '" rel="nofollow noopener noreferrer" target="_blank">' +
      c.account.username +
      '<span class="visually-hidden"> post</span>' +
      "</a>" +
      "</div>";

    // Date
    date = this.formatDate(c.created_at);
  }

  // Main text
  let text_css = "";
  if (this.TEXT_MAX_LINES !== "0") {
    text_css = "truncate";
    document.documentElement.style.setProperty(
      "--text-max-lines",
      this.TEXT_MAX_LINES
    );
  }

  if (c.spoiler_text !== "") {
    content =
      '<div class="toot-text">' +
      c.spoiler_text +
      ' <button type="button" class="spoiler-link" aria-expanded="false">Show more</button>' +
      '<div class="spoiler-text-hidden">' +
      this.formatTootText(c.content) +
      "</div>" +
      "</div>";
  } else if (
    c.reblog &&
    c.reblog.content !== "" &&
    c.reblog.spoiler_text !== ""
  ) {
    content =
      '<div class="toot-text">' +
      c.reblog.spoiler_text +
      ' <button type="button" class="spoiler-link" aria-expanded="false">Show more</button>' +
      '<div class="spoiler-text-hidden">' +
      this.formatTootText(c.reblog.content) +
      "</div>" +
      "</div>";
  } else if (
    c.reblog &&
    c.reblog.content !== "" &&
    c.reblog.spoiler_text === ""
  ) {
    content =
      '<div class="toot-text ' +
      text_css +
      '">' +
      "<div>" +
      this.formatTootText(c.reblog.content) +
      "</div>" +
      "</div>";
  } else {
    content =
      '<div class="toot-text ' +
      text_css +
      '">' +
      "<div>" +
      this.formatTootText(c.content) +
      "</div>" +
      "</div>";
  }

  // Media attachments
  let media = "";
  if (c.media_attachments.length > 0) {
    for (let picid in c.media_attachments) {
      media = this.placeMedias(c.media_attachments[picid], c.sensitive);
    }
  }
  if (c.reblog && c.reblog.media_attachments.length > 0) {
    for (let picid in c.reblog.media_attachments) {
      media = this.placeMedias(
        c.reblog.media_attachments[picid],
        c.reblog.sensitive
      );
    }
  }

  // Preview link
  let preview_link = "";
  if (!this.HIDE_PREVIEW_LINK && c.card) {
    preview_link = this.placePreviewLink(c.card);
  }

  // Poll
  let poll = "";
  let pollOption = "";
  if (c.poll) {
    for (let i in c.poll.options) {
      pollOption += "<li>" + c.poll.options[i].title + "</li>";
    }
    poll = '<div class="toot-poll">' + "<ul>" + pollOption + "</ul>" + "</div>";
  }

  // Date
  const timestamp =
    '<div class="toot-date">' +
    '<a href="' +
    url +
    '" rel="nofollow noopener noreferrer" tabindex="-1" target="_blank">' +
    date +
    "</a>" +
    "</div>";

  // Add all to main toot container
  const toot =
    '<article class="mt-toot" aria-posinset="' +
    (i + 1) +
    '" aria-setsize="' +
    this.TOOTS_LIMIT +
    '" data-location="' +
    url +
    '" tabindex="0">' +
    avatar +
    user +
    content +
    media +
    preview_link +
    poll +
    timestamp +
    "</article>";

  return toot;
};

/**
 * Handle text changes made to toots
 * @param {string} c Text content
 * @returns {string} Text content modified
 */
MastodonApi.prototype.formatTootText = function (c) {
  let content = c;

  // Format hashtags and mentions
  content = this.addTarget2hashtagMention(content);

  // Convert markdown styles into HTML
  if (this.MARKDOWN_BLOCKQUOTE) {
    content = this.replaceHTMLtag(
      content,
      "<p>&gt;",
      "</p>",
      "<blockquote><p>",
      "</blockquote></p>"
    );
  }

  return content;
};

/**
 * Add target="_blank" to all #hashtags and @mentions in the toot
 * @param {string} c Text content
 * @returns {string} Text content modified
 */
MastodonApi.prototype.addTarget2hashtagMention = function (c) {
  let content = c.replaceAll('rel="tag"', 'rel="tag" target="_blank"');
  content = content.replaceAll(
    'class="u-url mention"',
    'class="u-url mention" target="_blank"'
  );

  return content;
};

/**
 * Find all start/end <tags> and replace them by another start/end <tags>
 * @param {string} c Text content
 * @param {string} initialTagOpen Start HTML tag to replace
 * @param {string} initialTagClose End HTML tag to replace
 * @param {string} replacedTagOpen New start HTML tag
 * @param {string} replacedTagClose New end HTML tag
 * @returns {string} Text in HTML format
 */
MastodonApi.prototype.replaceHTMLtag = function (
  c,
  initialTagOpen,
  initialTagClose,
  replacedTagOpen,
  replacedTagClose
) {
  if (c.includes(initialTagOpen)) {
    const regex = new RegExp(initialTagOpen + "(.*?)" + initialTagClose, "gi");

    return c.replace(regex, replacedTagOpen + "$1" + replacedTagClose);
  } else {
    return c;
  }
};

/**
 * Place media
 * @param {object} m Media content
 * @param {boolean} s Spoiler/Sensitive status
 * @returns {string} Media in HTML format
 */
MastodonApi.prototype.placeMedias = function (m, s) {
  let spoiler = s || false;
  const pic =
    '<div class="toot-media ' +
    (spoiler ? "toot-media-spoiler" : "") +
    ' img-ratio14_7 loading-spinner">' +
    (spoiler ? '<button class="spoiler-link">Show content</button>' : "") +
    '<img onload="removeSpinner(this)" onerror="removeSpinner(this)" src="' +
    m.preview_url +
    '" alt="' +
    (m.description ? m.description : "") +
    '" loading="lazy" />' +
    "</div>";

  return pic;
};

/**
 * Place preview link
 * @param {object} c Preview link content
 * @returns {string} Preview link in HTML format
 */
MastodonApi.prototype.placePreviewLink = function (c) {
  let card =
    '<a href="' +
    c.url +
    '" class="toot-preview-link" target="_blank" rel="noopener noreferrer">' +
    (c.image
      ? '<div class="toot-preview-image"><img onload="removeSpinner(this)" onerror="removeSpinner(this)" src="' +
        c.image +
        '" alt="" loading="lazy" /></div>'
      : '<div class="toot-preview-noImage">📄</div>') +
    "</div>" +
    '<div class="toot-preview-content">' +
    (c.provider_name
      ? '<span class="toot-preview-provider">' + c.provider_name + "</span>"
      : "") +
    '<span class="toot-preview-title">' +
    c.title +
    "</span>" +
    (c.author_name
      ? '<span class="toot-preview-author">By ' + c.author_name + "</span>"
      : "") +
    "</div>" +
    "</a>";

  return card;
};

/**
 * Format date
 * @param {string} d Date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @returns {string} Date formated (MM DD, YYYY)
 */
MastodonApi.prototype.formatDate = function (d) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let date = new Date(d);

  const displayDate =
    monthNames[date.getMonth()] +
    " " +
    date.getDate() +
    ", " +
    date.getFullYear();

  return displayDate;
};

/**
 * Loading spinner
 * @param {object} e Image containing the spinner
 */
const removeSpinner = function (e) {
  const spinnerCSS = "loading-spinner";

  // Find closest parent container (1st, 2nd or 3rd level)
  let spinnerContainer = e.closest("." + spinnerCSS);

  if (spinnerContainer) {
    spinnerContainer.classList.remove(spinnerCSS);
  }
};
