const download_icon = '<g><path class="upsideDown" d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z"></path><path class="upsideDown" d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z"></path></g>'

$(document).on('DOMNodeInserted', init);


function init(event) {
  const tweets = $(event.target).find('article')

  if (tweets.length) {
    tweets.each((index, element) => {
      if (containsVideo(element)) {
        addDownloadButton(element);
      }
    })
  } else {
    if (containsVideo(event.target)) {
      addDownloadButton(event.target);
    }
  }
}

function containsVideo(element) {
  const check = $(element).html().includes('video')
  return check;
}


function addDownloadButton(target) {
  var tweet = $(target).closest('article');

  if (!tweet.length) {
    addButtonHelper(
      $(target).closest('div[aria-modal="true"]'),
      'div[aria-modal="true"]');

    return;
  }

  addButtonHelper(tweet, 'article');
}

function addButtonHelper(tweet, tag) {
  if (tweet.find('div[role="group"] div.download-icon').length) {
    return;
  }

  var icons = tweet.find('div[role="group"] div:nth-child(4)');
  icons.after(icons.clone())

  var download = icons.next()
  download.addClass('download-icon')
  download.children('div:first-child').attr('aria-label', 'Download button');
  download.find('svg').html(download_icon)
  download.click(tag, downloadVideo);
}

function downloadVideo(event) {
  const tweetSelector = event.data
  const tweet = $(event.currentTarget).closest(tweetSelector)
  var src = tweet.find('video')[0].src

  if (!src) {
    src = tweet.find('source')[0].src
  }

  if (src.includes('blob')) {
    const tweetId = getTweetId(tweet, tweetSelector);
    if (!!tweetId) {
      chrome.runtime.sendMessage({
        type: 'blob',
        id: tweetId,
        ct0: getCookie("ct0")
      })
    }
  } else if (src.includes('ext_tw_video')) {
    chrome.runtime.sendMessage({
      type: 'video',
      url: src
    });
  } else {
    chrome.runtime.sendMessage({
      type: 'gif',
      url: src
    });
  }
}


function getTweetId(tweet, selector) {
  const re = /(?:https:\/\/[A-z.]*\/\w*\/status\/)(\d*)(?:\/?\w*)/g;
  if (selector === '.tweet') {
    return tweet.data("tweet-id")
  } else if (selector === 'article') {
    for (const element of tweet.find('a').toArray()) {
      const match = re.exec(element.href)
      if (match) {
        return match[1];
      }
    }
  } else if (selector === 'div[aria-modal="true"]') {
    const match = re.exec(window.location.href)
    if (match) {
      return match[1];
    }
  }
}


function getCookie(name) {
  if (!document.cookie) {
    return null;
  }

  const csrfCookies = document.cookie.split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith(name + '='));

  if (csrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(csrfCookies[0].split('=')[1]);
}
