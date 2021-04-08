/*
 * @Author: Xin https://github.com/Xin-code 
 * @Date: 2021-04-06 17:21:16 
 * @Last Modified by: Xin 
 * @Last Modified time: 2021-04-08 10:40:07
 */

const $ = Env('朗果英语')

const notify = $.isNode() ? require('./sendNotify') : '';

const LANGOO_API_HOST = 'http://api.langooo.com'

const TokenArr = [] , UidArr = [] , TopicIdArr = []

$.message = ''

if ($.isNode()) {
  if (process.env.LANGOO_TOKEN && process.env.LANGOO_TOKEN.indexOf('#') > -1) {
    signToken = process.env.LANGOO_TOKEN.split('#');
  }else if(process.env.LANGOO_TOKEN && process.env.LANGOO_TOKEN.indexOf('#') > -1) {
    signToken = process.env.LANGOO_TOKEN.split('\n');
  }else{
    signToken = [process.env.LANGOO_TOKEN]
  }

  Object.keys(signToken).forEach((item) => {
    if (signToken[item]) {
      TokenArr.push(signToken[item])
    }
  })

  if (process.env.LANGOO_UID && process.env.LANGOO_UID.indexOf('#') > -1) {
    uid = process.env.LANGOO_UID.split('#');
  }else if(process.env.LANGOO_UID && process.env.LANGOO_UID.indexOf('#') > -1) {
    uid = process.env.LANGOO_UID.split('\n');
  }else{
    uid = [process.env.LANGOO_UID]
  }

  Object.keys(uid).forEach((item) => {
    if (uid[item]) {
      UidArr.push(uid[item])
    }
  })
}



!(async () => {
  for (let i = 0; i < TokenArr.length; i++) {
    token = TokenArr[i]
    uid = UidArr[i]

    console.log(`········【帐号${i+1}】开始········`)
    
    // 任务列表&初始化账号
    console.log(`\n📕执行 -> 获取任务列表`)
    await TaskList()

    // 签到
    console.log(`\n📕执行 -> 每日签到`)
    await SignIn()

    // 🎧听力练习
    console.log(`\n🎧执行 -> 听力练习`)
    for(let l = 0; l<10 ; l++){
      console.log(`当前完成第${l+1}次听力练习`)
      await Listen_Training()
      console.log(`等待了5s···`)
      await $.wait(5000)
    }

    // 📕阅读看世界
    console.log(`\n📕执行 -> 阅读看世界`)
    for(let l = 0; l<10 ; l++){
      console.log(`当前完成第${l+1}次阅读`)
      await Read_Training()
      console.log(`等待了5s···`)
      await $.wait(5000)
    }
    
    // 🧧领取奖励
    console.log(`\n🧧执行 -> 领取奖励`)
    for(let a = 0 ; a < 5; a++){
      topicId = TopicIdArr[a]
      console.log(`当前领取的TopicId为:${topicId}`)
      await Award(topicId)
      console.log(`等待了5s···`)
      await $.wait(5000)
    }
    
    // 📧推送消息
    await sendMsg()

    console.log(`········【帐号${i+1}】结束········`)

  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())
    

// 任务列表&初始化账号
async function TaskList(){
 return new Promise((resolve) => {
   let body = `{"uid":${uid},"channelNumber":2}`
   $.post(BodytaskUrl(`task/daily/taskList`,body),async(error, response, data) =>{
    try{
      if (error) {
        console.log(`${JSON.stringify(error)}`)
        console.log(`API请求失败，请检查网路重试`)
      } else {
        const result = JSON.parse(data)
        // 反馈信息
        // console.log(result)
        if(result.code!==200){
          console.log(`🧧 当前红包:${result.result.userRedAmout}`)
          $.message+=`🧧 当前红包:${result.result.userRedAmout}\n`
          console.log(`🎈 当前积分:${result.result.userScore}`)
          $.message+=`🎈 当前积分:${result.result.userScore}\n`

          TaskListArr = result.result.taskUserEvaluationVOList
          console.log(`📝 任务列表`)
          TaskListArr.forEach((item)=>{
            if(item.receivedRedId!==undefined){
              TopicIdArr.push(item.receivedRedId)
            }
            console.log(`ID:【${item.id}】,任务【${item.taskName}】,任务奖励:【${item.rewardScore}】积分`)
          })
          console.log(`当前领取TopicId数组为：${TopicIdArr}`)
        }else{
          console.log(`❌ 初始化失败！`)
        }
      }}catch(e) {
          console.log(e)
        } finally {
        resolve();
      } 
    })
   })
}

// 签到
async function SignIn() {
  return new Promise((resolve) => {
    let body = `{"uid":${uid},"channelNumber":2}`
    $.post(BodytaskUrl(`sign/day/sinIn`,body),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
        //  console.log(result) 
         if(result.result.integralNum!==1){
           console.log(`❌ 签到失败||重复签到`)
         }else{
           console.log(`✅ 签到成功！`)
           $.message+=`✅ 签到成功！\n`
         }
       }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}

// 🎧听力练习
async function Listen_Training(timeout = 1000) {
  return new Promise((resolve) => {
    let body = `{"uid":${uid},"channelNumber":2,"topicId":${Math.ceil(Math.random()*50000)},"type":"1"}`
    $.post(BodytaskUrl(`training/addUserScore`,body),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
         // console.log(result) 
        console.log(`${result.result.msg}`)
       }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    },timeout)
}

// 📕阅读看世界
async function Read_Training(timeout = 1000) {
  return new Promise((resolve) => {
    let body = `{"uid":${uid},"channelNumber":2,"topicId":${Math.ceil(Math.random()*50000)},"type":"2"}`
    $.post(BodytaskUrl(`training/addUserScore`,body),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
         // console.log(result) 
        console.log(`${result.result.msg}`)
       }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    },timeout)
}

// 🧧领取奖励
async function Award(topicId) {
  return new Promise((resolve) => {
    let body = `{"uid":${uid},"channelNumber":2,"topicId":${topicId}}`
    $.post(BodytaskUrl(`task/recevieRedBag`,body),async(error, response, data) =>{
     try{
       if (error) {
         console.log(`${JSON.stringify(error)}`)
         console.log(`API请求失败，请检查网路重试`)
       } else {
         const result = JSON.parse(data)
         // 反馈信息
         // console.log(result) 
        if(result.code == 200){
          console.log(`${result.message}`)
          $.message+=`${result.message}\n`
        } else {
          console.log(data)
        }
       }}catch(e) {
           console.log(e)
         } finally {
         resolve();
       } 
     })
    })
}

// 发送通知
async function sendMsg() {
  await notify.sendNotify(`朗果英语`,`${$.message}`);
}

 // BODYURL
 function BodytaskUrl(activity, body={}) {
  return {
    url: `${LANGOO_API_HOST}/${activity}`,
    body: body,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-Hans-CN;q=1",
      "Connection": "keep-alive",
      "Content-Type": "application/json",
      'Host': 'api.langooo.com',
      'token': token,
      'versionName': '3.8.1',
      'User-Agent': 'Langooo/3.8.1 (iPhone; iOS 14.3; Scale/3.00)'
    }
  }
}

// pretty-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}