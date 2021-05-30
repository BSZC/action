/*
 * @Author: Xin https://github.com/Xin-code 
 * @Date: 2021-04-10 15:06:28 
 * @Last Modified by: Xin 
 * @Last Modified time: 2021-05-30 14:37:48
 */

const $ = Env('电视家')

const notify = $.isNode() ? require('../../../Task/sendNotify') : '';

$.message = ''

const TV_API_HOST = 'http://api.gaoqingdianshi.com'

const CookieArr = [],AuthArr = []



if ($.isNode()) {  
  if (process.env.TV_HOME_COOKIE && process.env.TV_HOME_COOKIE.indexOf('#') > -1) {
    signCookie = process.env.TV_HOME_COOKIE.split('#');
  }else if(process.env.TV_HOME_COOKIE && process.env.TV_HOME_COOKIE.indexOf('#') > -1) {
    signCookie = process.env.TV_HOME_COOKIE.split('\n');
  }else{
    signCookie = [process.env.TV_HOME_COOKIE]
  }
  
  Object.keys(signCookie).forEach((item) => {
    if (signCookie[item]) {
      CookieArr.push(signCookie[item])
    }
  })

  if (process.env.TV_HOME_AUTH && process.env.TV_HOME_AUTH.indexOf('#') > -1) {
    signAuth = process.env.TV_HOME_AUTH.split('#');
  }else if(process.env.TV_HOME_AUTH && process.env.TV_HOME_AUTH.indexOf('#') > -1) {
    signAuth = process.env.TV_HOME_AUTH.split('\n');
  }else{
    signAuth = [process.env.TV_HOME_AUTH]
  }
  
  Object.keys(signAuth).forEach((item) => {
    if (signAuth[item]) {
      AuthArr.push(signAuth[item])
    }
  })
}

!(async () => {

  for(let i = 0 ; i < CookieArr.length;i++){

    cookie = CookieArr[i]
    auth = AuthArr[i]

    console.log(`📝执行 -> 每日签到`)
    await Sign_In()

    // console.log(`🏃‍执行 -> 走路赚钱`)
    // for(let w = 1 ; w < 100 ; w++){
    //   await Walk_Earn(w)
    // }

    console.log(`✍执行 -> 任务列表`)
    await Get_Task()

    console.log(`💰执行 -> 领取金币`)
    await Gold_List()
    
    // 推送消息
    // await sendMsg()
  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())
    


// 日常签到📝
async function Sign_In() {
  // 调用API
  await Sign_In_API()
  if(result.errCode!==0){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(result)
  }
}

// 走路赚钱🏃‍
async function Walk_Earn(num) {
  // 调用API
  await Walk_Earn_API(num)
  if(result.errCode!==0){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`本次增加金币💰:[${result.data}]个`);
  }
}

// 任务列表✍
async function Get_Task() {
  // 调用API
  await Get_Task_API()
  if(result.errCode!==0){
    console.log(`❌ ${result.msg}`)
  }else{
    // console.log(result.data)
    let taskList = result.data
    for(let i = 0 ; i < taskList.length ; i++){
      item = taskList[i]
      console.log(`任务:[${item.name}],任务ID:[${item.code}],当前任务:[${item.dayCompCount}/${item.dayDoCountMax}]`)
      console.log(`等待5s···`)
      await $.wait(5000)
      await Get_Task_Done(item.code)
    }
  }
}

// 完成任务✅
async function Get_Task_Done(code) {
  // 调用API
  await Get_Task_Done_API(code)
  if(result.errCode!==0){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`任务:[${result.data.name}],获得金币💰:[${result.data.coin}]个`)
  }
}

// 金币列表💰
async function Gold_List() {
  // 调用API
  await Gold_List_API()
  if(result.errCode!==0){
    console.log(`❌ ${result.msg}`)
  }else{
    let CoinList = result.data.tempCoin
    for(let i = 0 ; i < CoinList.length ; i++){
      coinInfo = CoinList[i]
      console.log(`领取:任务[${coinInfo.from}],任务ID:[${coinInfo.id}],可领取金币:[${coinInfo.coin}]`)
      console.log(`等待5s···`)
      await $.wait(5000)
      await Gold_Collect(coinInfo.id)
    }
  }
}

// 领取金币💰
async function Gold_Collect(code){
  // 调用API
  await Gold_Collect_API(code)
  if(result.errCode!==0){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`领取金币💰成功`)
  }
}


// 推送消息
async function sendMsg() {
  await notify.sendNotify(`xxxx`,`${$.message}`);
}

// ==================API==================

// 日常签到📝API
async function Sign_In_API() {
  await getRequest(`api/v7/sign/signin?accelerate=0&ext=0&ticket=`)
}

// 走路赚钱🏃‍API
async function Walk_Earn_API(num) {
  await getRequest(`api/taskext/getCoin?code=walk&coin=${num}&ext=0`)
}

// 任务列表✍API
async function Get_Task_API() {
  await getRequest(`api/v5/task/get`)
}

// 完成任务✅API
async function Get_Task_Done_API(code) {
  await getRequest(`api/v5/task/complete?code=${code}&comType=0`)
}

// 金币列表💰API
async function Gold_List_API() {
  await getRequest(`api/coin/info`)
}

// 领取金币💰API
async function Gold_Collect_API(code) {
  await getRequest(`api/coin/temp/exchange?id=${code}`)
}


// ==================请求==================

// 正常请求 增加代码的复用率
// RequestBody
function getRequest(function_id, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.get(taskUrl(function_id), (err, resp, data) => {
        try {
          if (err) {
            console.log('\nAPI查询请求失败 ‼️‼️')
            console.log(JSON.stringify(err));
            console.log(`function_id:${function_id}`)
          } else {
            result = JSON.parse(data);
          }} catch (e) {
            console.log(e)
        } finally {
          resolve(data);
        }
      })
    }, timeout)
  })
} 


// URL
function taskUrl(activity) {
  return {
    url: `${TV_API_HOST}/${activity}`,
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'zh-Hans;q=1',
      'AppVerCode': '195',
      'AppVerName': '1.86',
      'Authorization': auth,
      'Cache-Control': 'no-cache',
      'Connection': 'close',
      'Cookie': cookie,
      'Generation': 'com.dianshijia.mobile.ios',
      'Host': 'api.gaoqingdianshi.com',
      'HwDevice': 'Iphone',
      'HwId': '385ba5a9f7224c5fb877d98aefe7e2c6',
      'MarketChannelName': 'Iphone',
      'User-Agent': 'Dsj/Client1.2',
      'appId': `19227f89ea1a166451593601eb8a1b4f`,
      'areaCode': '330000',
      'cityCode': '330100',
      'countryCode': 'CN',
      'erid': '59081',
      'gpsCityCode': '330100',
      'hwBrand': 'iPhone',
      'hwModel': 'iPhone13,2',
      'language': 'zh_CN',
      'routerMac': '48eec38ea84',
      'ssid': '0198fede-19c9-4e2c-87ce-d6c496528f56',
      'userid': '160183d84ac4dd90d487cfe0ac964452',
      'uuid': '385ba5a9f7224c5fb877d98aefe7e2c6',
    }
  }
}

// pretty-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}