chrome.runtime.onMessage.addListener(download);

function download(request) {
  switch (request.type) {
    case 'blob':
      processBlob(request.id, request.ct0);
      break;

    case 'video':
      downloadMp4(request.url);
      break;

    case 'gif':
      downloadMp4(request.url);
      break;
  }
}


async function processBlob(id, token) {
  var twitter_url = "https://api.twitter.com/1.1/statuses/show.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_reply_count=1&tweet_mode=extended&trim_user=false&include_ext_media_color=true&id=" + id;
  var video_url = await retrieveUrl(twitter_url, token);

  downloadMp4(video_url);
}


function retrieveUrl(url, token) {
  return new Promise((resolve, reject) => {
    var init = {
      origin: 'https://mobile.twitter.com',
      headers: {
        "Accept": '*/*',
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
        "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAADS7TQEAAAAAHbwshx%2Fl3CayoMT8zgmJbxh7emI%3DW4XMs0LGbXk7AbEHSKMOZ21UrUGaUYpD7x2fusKk01pTaCFRBV",
        "x-csrf-token": token
      },
      credentials: 'include',
      referrer: 'https://mobile.twitter.com'
    };

    fetch(url, init)
      .then((response) => {
        if (response.status == 200) {
          response.json().then((json) => {
            let mp4Variants = json.extended_entities.media[0].video_info.variants.filter(variant => variant.content_type === 'video/mp4')
            mp4Variants = mp4Variants.sort((a, b) => (b.bitrate - a.bitrate))

            let url = ''
            if (mp4Variants.length) {
              url = mp4Variants[0].url
            }
            resolve(url);
          })
        } else {
          reject({
            status: response.status,
            statusText: response.statusText
          });
        }
      })
      .catch((err) => {
        reject({
          error: err
        });
      });
  });
}


function downloadMp4(url) {
  chrome.downloads.download({
    url: url
  });
}
