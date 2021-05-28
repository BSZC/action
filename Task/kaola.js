/*
 * @Author: Xin https://github.com/Xin-code 
 * @Date: 2021-05-27 13:36:57 
 * @Last Modified by: Xin 
 * @Last Modified time: 2021-05-28 18:33:10
 */

const $ = Env('考拉海购')

const CookiesArr = []

const KAOLA_API_HOST = 'https://m-bean.kaola.com'

$.message = ''

const notify = $.isNode() ? require('./sendNotify') : '';

// 任务Id集合
const jobIdArr = []

// if ($.isNode()) {
  // if (process.env.XXXX_XXXXX && process.env.XXXX_XXXXX.indexOf('#') > -1) {
  //   xxxx = process.env.XXXX_XXXXX.split('#');
  // }else if(process.env.XXXX_XXXXX && process.env.XXXX_XXXXX.indexOf('#') > -1) {
  //   xxxx = process.env.XXXX_XXXXX.split('\n');
  // }else{
  //   xxxx = [process.env.XXXX_XXXXX]
  // }

  // Object.keys(xxxx).forEach((item) => {
  //   if (xxxx[item]) {
  //     XXXXxxxx.push(xxxx[item])
  //   }
  // })
// }

!(async () => {
  for (let i = 0; i < CookiesArr.length; i++) {

    console.log(`········【帐号${i+1}】开始········`)

    cookie = CookiesArr[i]
    
    console.log(`\n执行 -> 日常签到`);
    await daily_sign()

    console.log(`\n执行 -> 获取任务列表`);
    await task_list()

    console.log(`\n执行 -> 完成任务`)
    for (let i = 0; i<jobIdArr.length; i++){
        jobid = jobIdArr[i]
        await task_finish(jobid)
    }
    
    // 推送消息
    // await sendMsg()

    console.log(`········【帐号${i+1}】结束········`)

  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())


// ==================功能模块==================
// 日常签到
async function daily_sign() {
  // 调用API
  await daily_sign_API()
  console.log( );
  let result = JSON.parse($.daily_sign_API_Result)
  if(result.code!==200){
      // 重复签到
      console.log(`❌ ${result.data.msg}`);
  }else{
      // 签到成功
      console.log(`✅ ${result.data.msg}\n 本次签到获得${result.data.point}考拉豆🥔 \n 总共签到:${result.data.signCount}天`);
  }
}

// 获取任务列表
async function task_list(){
    // 调用‍API
    await task_list_API();
    // console.log(result)
    if(result.code!==200){
        console.log(`❌ ${result.data.msg}`);
    }else{
        let taskList = result.data.allJobList
        taskList.forEach((item) => {
            // console.log(item);
            jobIdArr.push(item.jobId)
            console.log(`${item.text}=>[${item.title} ${item.completeNum}/${item.missionNum}],每次可获得${item.pointNum}个考拉豆🥔`);
        })
    }
}

// 完成任务
async function task_finish(id){
    // 调用‍API
    console.log(`去完成任务id`+id);
    await task_finish_API(id);
    // console.log(result);
    if(result.code!==200){
        console.log(`❌ ${result.desc}`)
    }else{
        console.log(result.retDesc);
    }
}


// 推送消息
// async function sendMsg() {
//   await notify.sendNotify(`xxxx`,`${$.message}`);
// }

// ==================API==================
// API
async function xxx_API() {
  await postRequest(``)
}

// 日常签到API
async function daily_sign_API() {
  let body = `{"deviceId": ""}`
  $.daily_sign_API_Result = await postRequestBody(`m/point/sign.html`,body)
}

// 任务列表API
async function task_list_API() {
    await getRequest(`m/point/getCreditsJobList.html`)
}

// 任务完成API
async function task_finish_API(id) {
    await getRequest(`m/point/creditjob/getpay.html?jobId=${id}`)
}



// ==================请求==================

// 正常请求 增加代码的复用率
function getRequest(url, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.get(taskUrl(url), (err, resp, data) => {
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
function taskUrl(url) {
  return {
    url: `${KAOLA_API_HOST}/${url}`,
    headers: {
        'Cookie':cookie,
        'Host': 'm-bean.kaola.com',
        'Origin': 'https://m-bean.kaola.com',
        'Referer': 'https://m-bean.kaola.com/app/index?_noheader=true&_toggleTitle=true&_fullscreen=true&_wk=true&kpm=cGVyc29uYWxQYWdl._._._%40%40_%40%40_&spm=a215sy.page_kla_personalpage.myservice.1&scm=20140734.mt_15947783.252361.dt_1-buid_&1-res_363675-s_20083755-cts_1622087724592-f_14129901-g_152-pi_251-fa_520350-isResource_1-url_aHR0cHM6Ly9tLWJlYW4ua2FvbGEuY29tL2FwcC9pbmRleD9fbm9oZWFkZXI9dHJ1ZSZfdG9nZ2xlVGl0bGU9dHJ1ZSZfZnVsbHNjcmVlbj10cnVlJl93az10cnVl-ml_15826917&klwv=true&platform=2&version=45000&apiVersion=208&appChannel=1&width=1170&network=wifi&appVersion=4.50.0&deviceUdID=YKAMNC1wUwYDAH1KoXmtXJp1&deviceUdidToken=1075706897C03A0BBDAC213D3E4D316B5258B353747D412D6470E15CFCB15AB3',
    }
  }
}

// 带Body的请求 增加代码的复用率
// RequestBody
function postRequestBody(url, body = {}, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.post(BodytaskUrl(url, body), (err, resp, data) => {
        try {
          if (err) {
              console.log(err);
            console.log('\nAPI查询请求失败 ‼️‼️')
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

 // BODYURL
 function BodytaskUrl(url, body={}) {
  return {
    url: `${KAOLA_API_HOST}/${url}`,
    body: `${escape(JSON.stringify(body))}`,
    headers: {
        'Cookie':cookie,
        'Host': 'm-bean.kaola.com',
        'Origin': 'https://m-bean.kaola.com',
        'Referer': 'https://m-bean.kaola.com/app/index?_noheader=true&_toggleTitle=true&_fullscreen=true&_wk=true&kpm=cGVyc29uYWxQYWdl._._._%40%40_%40%40_&spm=a215sy.page_kla_personalpage.myservice.1&scm=20140734.mt_15947783.252361.dt_1-buid_&1-res_363675-s_20083755-cts_1622087724592-f_14129901-g_152-pi_251-fa_520350-isResource_1-url_aHR0cHM6Ly9tLWJlYW4ua2FvbGEuY29tL2FwcC9pbmRleD9fbm9oZWFkZXI9dHJ1ZSZfdG9nZ2xlVGl0bGU9dHJ1ZSZfZnVsbHNjcmVlbj10cnVlJl93az10cnVl-ml_15826917&klwv=true&platform=2&version=45000&apiVersion=208&appChannel=1&width=1170&network=wifi&appVersion=4.50.0&deviceUdID=YKAMNC1wUwYDAH1KoXmtXJp1&deviceUdidToken=1075706897C03A0BBDAC213D3E4D316B5258B353747D412D6470E15CFCB15AB3',
    }
  }
}

// pretty-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}