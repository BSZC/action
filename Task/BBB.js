/*
 * @Author: Xin https://github.com/Xin-code 
 * @Date: 2021-04-08 11:18:12 
 * @Last Modified by: Xin 
 * @Last Modified time: 2021-04-09 16:20:15
 * 
 * 下载链接:http://bububao.yichengw.cn/?id=527716
 */

const $ = Env('步步宝')

const notify = $.isNode() ? require('./sendNotify') : '';

$.message = ''

$.guessCYNum = 1

const BBB_API_HOST = 'https://bububao.duoshoutuan.com'

const tokenArr = []

if ($.isNode()) {
  if (process.env.BBB_TOKEN && process.env.BBB_TOKEN.indexOf('#') > -1) {
    token = process.env.BBB_TOKEN.split('#');
  }else if(process.env.BBB_TOKEN && process.env.BBB_TOKEN.indexOf('#') > -1) {
    token = process.env.BBB_TOKEN.split('\n');
  }else{
    token = [process.env.BBB_TOKEN]
  }

  Object.keys(token).forEach((item) => {
    if (token[item]) {
      tokenArr.push(token[item])
    }
  })
}

!(async () => {
  for (let i = 0; i < tokenArr.length; i++) {

    token = tokenArr[i]

    console.log(`········【帐号${i+1}】开始········`)

    console.log(`👨‍💻执行 -> 初始化信息`)
    await Init()

    console.log(`\n📝执行 -> 每日签到`)
    await Daily_CheckIn()

    console.log(`\n💰执行 -> 首页金币`)
    await Home_Gold()

    //🧧 首页红包 TODO

    console.log(`\n🥚执行 -> 首页金蛋`)
    await Home_Egg_Click()

    console.log(`\n🕗执行 -> 早起&早睡打卡`)
    if(new Date().getHours()>4&&new Date().getHours()<12){
      console.log(`当前时间:[${new Date().getHours()}],在早起打卡的时间段(🕗04:00-12:00)内,执行早起打卡:`)
      let Now = [1,2,3]
      for(let n = 0 ; n < Now.length ; n++){
        now = Now[n]
        await Dk_Click(now)
      }
    }else if(new Date().getHours()>20&&new Date().getHours()<4){
      console.log(`当前时间:[${new Date().getHours()}],在早睡打卡的时间段(🕗20:00-04:00)内,执行晚上打卡:`)
      let Now = [4,5,6]
      for(let n = 0 ; n < Now.length ; n++){
        now = Now[n]
        await Dk_Click(now)
      }
    }else{
      console.log(`当前不在[04:00-12:00][20:00-04:00]时间段内`)
    }

    console.log(`\n📕执行 -> 猜成语`)
    for(let g = 0 ; g < $.guessCYNum ;g++){
      await Cy_Info()
      if(result.code===-1){
        continue
      }
      console.log(`看视频等待了40s···`)
      await $.wait(40000)
      // 看视频操作
      await Cy_Video(30-g)
      // 记录操作
      await Cy_Record(g)
    }

    console.log(`\n💧执行 -> 喝水领金币`)
    await Water_Info()

    console.log(`\n💤执行 -> 睡觉赚金币`)
    await Sleep_Info()

    console.log(`\n🎟执行 -> 刮刮乐`)
    await Gua_List()
    $.signArr = []
    $.glidArr = []
    for(let g = 0 ; g < $.guaIdArr.length ; g++){
      guaId = $.guaIdArr[g]
      await Gua_Info(guaId)
    }
    for(let p = 0 ; p < $.signArr.length ; p++){
      sign = $.signArr[p]
      glid = $.glidArr[p]
      await Gua_Award(sign,glid)
      console.log(`等待了5s···`)
      await $.wait(5000)
    }

    console.log(`\n🎡执行 -> 幸运抽奖`)
    await Lucky_Init()
    for(let l = 0 ; l < $.luckyNum ; l++){
      await Lucky_Click()
      console.log(`\n等待了5s···`)
      await $.wait(5000)
    }

    console.log(`\n👀执行 -> 看看赚`)
    $.H5_List_IDArr = []
    await H5_List()
    for(let h = 0 ; h < $.H5_List_IDArr.length ; h++){
      id = $.H5_List_IDArr[h]
      await H5_News(id)
    }

    console.log(`\n👁执行 -> 看看`)
    $.go = true 
    if($.go){
      for(let k = 0 ; k < 15; k++){
        await News()
      }
    }else{
      console.log(`当前已经获得最大金币数:[900]个,跳出循环`)
    }

    console.log(`\n📺执行 -> 看视频赚金币`)
    for(let a = 0 ; a < 5 ; a++){
      await Watch_Video()
    }

    console.log(`\n📘执行 -> 点广告领金币`)
    for(let a = 0 ; a < 5 ; a++){
      await Admobile_Show()
    }

    console.log(`\n💰执行 -> 领取任务奖励`)
    for(let t = 0 ; t < 10 ; t++){
      await Renwu_Done(t)
    }

    console.log(`\n💴执行 -> 提现`)
    if($.money>=0.3){
      console.log(`提现￥0.3`)
      await With_Draw(0.3)
    }else if($.money>=50){
      console.log(`提现￥50`)
      await With_Draw(50)
    }else{
      console.log(`当前金额不足以提现···`)
    }
    
    // 📧推送消息
    // await sendMsg()

    console.log(`········【帐号${i+1}】结束········`)

  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())


// 初始化信息👨‍💻
async function Init(){
  // 调用API
  await Init_API()
  if(result!==undefined){
    console.log(`用户初始化成功✅`)
    console.log(`金币💰:${result.jinbi}`)
    $.money = result.money
    console.log(`金额💵:${result.money}`)
    console.log(`邀请码:${result.invite_code}`)
    console.log(`------\n当日金币:${result.day_jinbi}\n当日步数:${result.steps}`)
  }else{
    console.log(`❌ 初始化失败！`)
  }
}

// 每日签到📝
async function Daily_CheckIn() {
  // 调用API
  await Daily_CheckIn_API()
  // 反馈信息
  // console.log(result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`签到成功✅,获得金币💰:[${result.jinbi}]个`)
  }
}

// 首页金币💰
async function Home_Gold() {
  // 调用API
  await Home_Gold_API()
  // 反馈信息
  // console.log(result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`${result.msg},获得金币💰:[${result.jinbi}]个`)
  }
}


// 首页金蛋🥚
async function Home_Egg_Click() {
  // 调用API
  await Home_Egg_Click_API()
  // 反馈信息
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`当前点击的TaskID为:[${result.taskid}]`)
    console.log(`当前点击的nonce_str为:[${result.nonce_str}]`)
    // 获取到taskID和nonce_str去领取奖励
    await Home_Egg_Done(result.taskid,result.nonce_str)
  }
}


// 首页金蛋奖励💰
async function Home_Egg_Done(id,str) {
  // 调用API
  await Home_Egg_Done_API(id,str)
  let result = JSON.parse($.Home_Egg_Done_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`\n获得💰:[${result.jinbi}]个`)
  }
}


// 🕗早起打卡[1,2,3]
// (4:00-12:00)
// 🕗早睡打卡[4,5,6]
// (20:00-4:00)
async function Dk_Click(num) {
  // 调用API
  await Dk_Click_API(num)
  let result = JSON.parse($.Dk_Click_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`\n获得💰:[${result.jinbi}]个`)
  }
}

// 📕猜成语
async function Cy_Info() {
  // 调用API
  await Cy_Info_API()
  if(result.code!==1){
    console.log(`❌ 获取成语失败！`)
  }else{
    let cy_id = result.cy_id
    console.log(`\n当前成语ID:[${result.cy_id}]`)
    let site = result.site
    console.log(`当前正确的位置为:[${result.site}]`)
    console.log(`等待了5s···`)
    await $.wait(5000)
    await Cy_Click(cy_id,site)
}
}

// 📕猜成语-提交答案
async function Cy_Click(cy_id,site) {
  // 调用API
  await Cy_Click_API(cy_id,site)
  let result = JSON.parse($.Cy_Click_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    $.guessCYNum = result.day_num
    console.log(`当前剩余次数:[${result.day_num}]次`)
    console.log(`${result.msg}!本次获得金币💰:[${result.jinbi}]个`)
  }
}

// 📕猜成语-看视频
async function Cy_Video(index) {
  // 调用API
  await Cy_Video_API(index)
  let result = JSON.parse($.Cy_Video_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`✅ ${result.msg}`)
  }
}


// 📕猜成语-记录
async function Cy_Record(index) {
  // 调用API
  await Cy_Record_API(index)
  let result = JSON.parse($.Cy_Record_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`${result.msg}`)
  }
}


// 💧喝水领金币
async function Water_Info() {
  // 调用API
  await Water_Info_API()
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    let drinkTime = 7-((result.all_num-result.now_num)/500)+1
    console.log(`当前为第:[${drinkTime}]次`)
    console.log(`可获取金币:[${result.now_num}/${result.all_num}]`)
    if(result.next_time!==0){
      console.log(`下一次领取金币需等待:[${result.next_time}]秒`)
    }else{
      console.log(`看视频等待了40s···`)
      await $.wait(40000)
      await Water_Video(drinkTime-1)
      console.log(`🕗到点,可以领取金币`)
      await Water_Click(drinkTime-1)
    }
  }
}

// 💧领取奖励
async function Water_Click(index) {
  // 调用API
  await Water_Click_API(index)
  let result = JSON.parse($.Water_Click_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`🚰${result.msg},获得金币💰:[${result.jinbi}]个`)
  }
}

// 💧喝水视频
async function Water_Video(index) {
  // 调用API
  await Water_Video_API(index)
  let result = JSON.parse($.Water_Video_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`✅ ${result.msg}`)
  }
}

// 💤睡觉赚 - 初始化信息
async function Sleep_Info() {
  // 调用API
  await Sleep_Info_API()
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    if(result.is_sleep!=='0'){
      console.log(`去执行结束睡觉···`)
      await Sleep_End()
    }else{
      console.log(`当前未睡觉,开启睡觉活动···`)
      await Sleep_Start()
    }
  }
}

// 💤睡觉赚 - 开始
async function Sleep_Start() {
  // 调用API
  await Sleep_Start_API()
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`✅ 开始睡觉 ${result.msg}`)
  }
}

// 💤睡觉赚 - 结束
async function Sleep_End() {
  // 调用API
  await Sleep_End_API()
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`🎉结束睡觉成功！\n可以收取金币:[${result.jinbi}]个\n当前taskid为:${result.taskid}\n当前nonce_str为:${result.nonce_str}`)
    await Sleep_Done(result.taskid,result.nonce_str)
    console.log(`等待了10s···`)
    await $.wait(10000)
    await Sleep_Start()
  }

}

// 💤睡觉赚 - 领取奖励
async function Sleep_Done(taskid,str) {
  // 调用API
  await Sleep_Done_API(taskid,str)
  let result = JSON.parse($.Sleep_Done_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`${result.msg},获得金币💰:[${result.jinbi}]个`)
  }

}

// 🎟刮刮乐 - 列表
async function Gua_List() {
  // 调用API
  await Gua_List_API()
  $.guaIdArr = []
  if(result.list.length===0){
    console.log(`已完成刮刮乐任务！`)
  }
  result.list.forEach((item)=>{
    console.log(`刮刮乐ID:[${item.id}],金额:[${item.jine}]${item.jine_txt}`)
    if(item.jine!==0){
      $.guaIdArr.push(item.id)
    }
  })
}

// 刮刮乐 - 详细信息
async function Gua_Info(id) {
  // 调用API
  await Gua_Info_API(id)
  let result = JSON.parse($.Gua_Info_Result)
  $.signArr.push(result.sign)
  $.glidArr.push(result.glid)
}

// 刮刮乐 - 领取奖励
async function Gua_Award(sign,glid) {
  // 调用API
  await Gua_Award_API(sign,glid)
  let result = JSON.parse($.Gua_Award_Result)
  console.log(`本次刮刮乐获得金币💰:[${result.jf}]个`)
}

// 🎡抽奖 100 次
async function Lucky_Init() {
  // 调用API
  await Lucky_Init_API()
  $.luckyNum = result.lucky_num
  if($.luckyNum==='0'){
    await Lucky_Box(4)
  }
  console.log(`当前剩余抽奖次数:[${result.lucky_num}]`)
}


// 🎡抽奖100次
async function Lucky_Click() {
  // 调用API
  await Lucky_Click_API()
  console.log(`${result.tip},${result.msg},获得金币💰:[${result.jinbi}]个,剩余抽奖次数[${result.lucky_num}]`)
  console.log(`当前可以开启宝箱:[${result.lucky_box}]`)
  if(result.lucky_box.indexOf('1') !==-1){
    console.log(`发现可领取的奖励，去领取🔑幸运宝箱奖励`)
    await Lucky_Box(result.lucky_box.indexOf('1')+1)
  }
}

// 开启🔑幸运宝箱
async function Lucky_Box(index) {
  // 调用API
  await Lucky_Box_API(index)
  let result = JSON.parse($.Lucky_Box_Result)
  console.log(`${result.msg}!,获得金币💰:[${result.jinbi}]个`)
}

// 获取👀看看赚列表
async function H5_List() {
  // 调用API
  await H5_List_API()
  let result = JSON.parse($.H5_List_Result)
  result.forEach((item)=>{
    $.H5_List_IDArr.push(item.id)
  })
}

// 进入👀看看赚详细列表页面
async function H5_News(id) {
  // 调用API
  await H5_News_API(id)
  let result = JSON.parse($.H5_News_Result)
  console.log(`当前任务的taskid为:${result.taskid}`)
  console.log(`当前任务的nonce_str为:${result.nonce_str}`)
  console.log(`等待了60s···`)
  await $.wait(60000)
  // 获取到taskid和nonce_str去完成任务
  await H5_News_Done(result.taskid,result.nonce_str)
}

// 领取👀看看赚奖励
async function H5_News_Done(taskid,nonce_str) {
  // 调取API
  await H5_News_Done_API(taskid,nonce_str)
  let result = JSON.parse($.H5_News_Done_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`任务【${result.msg}】完成,获得金币💰:[${result.jinbi}]个`)
  }
}

// 底部 - 👁看看
async function News() {
  // 调用API
  await News_API()
  let result = JSON.parse($.News_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`\n开始执行:${result.tip}`)
    console.log(`现在看的新闻为:${result.nonce_str}`)
    console.log(`等待了60s···`)
    await $.wait(60000)
    await News_Done(result.nonce_str)

  }
}

// 底部 - 👁看看完成任务
async function News_Done(nonce_str){
  // 调用API
  await News_Done_API(nonce_str)
  let result = JSON.parse($.News_Done_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    if(result.day_jinbi>=900){
      $.go = false
    }
    console.log(`获得金币💰:[${result.jinbi}]个\n当日共获得金币:[${result.day_jinbi}]个`)
  }
}

// 任务 - 📘点广告领金币
async function Admobile_Show() {
  // 调用API
  await Admobile_Show_API()
  // console.log(result);
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`\n当前广告的ID:[${result.ad_id}],${result.msg}`)
    await Admobile_Click(result.ad_id)
  }
}

// 任务 - 📘广告领金币详细信息
async function Admobile_Click(ad_id) {
  // 调用API
  await Admobile_Click_API(ad_id)
  let result = JSON.parse($.Admobile_Click_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`获取到广告的详细信息···\n当前广告的ID为:[${result.ad_id}]\n当前广告的nonce_str为:[${result.nonce_str}]`)
    await Admobile_Done(result.ad_id,result.nonce_str)
  }
}

// 任务 - 📘广告领取金币奖励
async function Admobile_Done(ad_id,nonce_str) {
  // 调用API
  await Admobile_Done_API(ad_id,nonce_str)
  let result = JSON.parse($.Admobile_Done_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`本次获得金币💰:[${result.jinbi}]个`)
  }
}

// 任务 - 📺看视频赚金币
async function Watch_Video() {
  // 调用API
  await Watch_Video_API()
  let result = JSON.parse($.Watch_Video_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`当前视频的nonce_str为:[${result.nonce_str}]`)
    console.log(`等待了50s···`)
    await $.wait(50000)
    await Watch_Video_Done(result.nonce_str)
    console.log(`等待了5分钟···`)
    await $.wait(300000)
  }
}

// 任务 - 📺看视频赚金币
async function Watch_Video_Done(nonce_str) {
  // 调用API
  await Watch_Video_Done_API(nonce_str)
  let result = JSON.parse($.Watch_Video_Done_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`增加金币💰:[50]个`)
  }
}


// 💰领取任务奖励
async function Renwu_Done(num) {
  // 调用API
  await Renwu_Done_API(num)
  let result = JSON.parse($.Renwu_Done_Result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`领取任务id[${num}]成功`);
  }
}

// 💴提现
async function With_Draw() {
  // 调用API
  await With_Draw_API(1)
  let result = JSON.parse($.With_Draw_Result)
  console.log(result)
  if(result.code!==1){
    console.log(`❌ ${result.msg}`)
  }else{
    console.log(`提现成功`)
  }
}

async function sendMsg() {
  await notify.sendNotify(`步步宝`,`${$.message}`);
}


// ==================API==================
// 初始化信息👨‍💻API
async function Init_API() {
  await postRequest(`user/profile`)
}

// 每日签到📝API
async function Daily_CheckIn_API() {
  await postRequest(`user/sign`)
}

// 首页金币💰API
async function Home_Gold_API() {
  await postRequest(`user/homejin`)
}

// 首页金蛋点击事件🥚API
async function Home_Egg_Click_API(){
  await postRequest(`user/jindan_click`)
}

// 首页金蛋奖励💰API
async function Home_Egg_Done_API(id,str){
  let body =`taskid=${id}&clicktime=${JSON.stringify(JSON.stringify(new Date().getTime()).slice(0,10)-0)}&donetime=${JSON.stringify(JSON.stringify(new Date().getTime()).slice(0,10)-0+2)}&nonce_str=${str}&`
  $.Home_Egg_Done_Result = await postRequestBody(`user/jindan_done`,body)
}

// 早起&早睡打卡🕗API
async function Dk_Click_API(num) {
  let body = `now_time=${num}&`
  $.Dk_Click_Result = await postRequestBody(`mini/dk_click`,body)
}

// 猜成语📕API
async function Cy_Info_API() {
  await postRequest(`mini/cy_info`)
}

// 猜成语点击事件📕API
async function Cy_Click_API(cy_id,site) {
  let body = `cy_id=${cy_id}&site=${site}&`
  $.Cy_Click_Result = await postRequestBody(`mini/cy_click`,body)
}

// 猜成语看视频📕API
async function Cy_Video_API(num) {
  let body = `day_num=${num}&`
  $.Cy_Video_Result = await postRequestBody(`mini/cy_sp`,body)
}

// 猜成语记录📕API
async function Cy_Record_API(num) {
  let body = `mini_type=${num}&`
  $.Cy_Record_Result = await postRequestBody(`user/mini_open`,body)
}

// 喝水领金币💧API
async function Water_Info_API() {
  await postRequest(`mini/water_info`)
}

// 喝水领金币点击事件💧API
async function Water_Click_API(num) {
  let body = `day_num=${num}&`
  $.Water_Click_Result = await postRequestBody(`mini/water_click`,body)
}

// 喝水领金币看视频💧API
async function Water_Video_API(num){
  let body = `day_num=${num}&`
  $.Water_Video_Result = await postRequestBody(`mini/water_sp`,body)
}

// 睡眠赚初始化信息💤API
async function Sleep_Info_API() {
  await postRequest(`mini/sleep_info`)
}

// 睡眠赚开启💤API
async function Sleep_Start_API() {
  await postRequest(`mini/sleep_start`)
}

// 睡眠赚结束💤API
async function Sleep_End_API() {
  await postRequest(`mini/sleep_end`)
}

// 睡眠赚奖励💤API
async function Sleep_Done_API(taskid,nonce_str) {
  let body = `taskid=${taskid}&nonce_str=${nonce_str}&=`
  $.Sleep_Done_Result = await postRequestBody(`mini/sleep_done`,body)
}

// 刮刮乐列表🎟API
async function Gua_List_API() {
  await postRequest(`gua/gualist`)
}

// 刮刮乐详细信息🎟API
async function Gua_Info_API(num) {
  let body = `gid=${num}&`
  $.Gua_Info_Result = await postRequestBody(`gua/guadet`,body)
}

// 刮刮乐领取奖励🎟API
async function Gua_Award_API(sign,glid) {
  let body = `sign=${sign}&gid=1&glid=${glid}&`
  $.Gua_Award_Result = await postRequestBody(`gua/guapost`,body)
}

// 抽奖100次初始化🎡API
async function Lucky_Init_API() {
  await postRequest(`user/lucky`)
}

// 抽奖100次点击事件🎡API
async function Lucky_Click_API() {
  await postRequest(`user/lucky_click`)
}

// 幸运宝箱🔑API
async function Lucky_Box_API(num) {
  let body = `box=${num}&`
  $.Lucky_Box_Result = await postRequestBody(`user/lucky_box`,body)
}

// 看看赚👀API
async function H5_List_API() {
  let body = `page=1&page_limit=25&=`
  $.H5_List_Result = await postRequestBody(`user/h5_list`,body)
}

// 看看赚 - 详细列表页👀API
async function H5_News_API(id) {
  let body = `mini_id=${id}`
  $.H5_News_Result = await postRequestBody(`user/h5_news`,body)
}

// 看看赚 - 完成任务👀API
async function H5_News_Done_API(taskid,nonce_str) {
  let body = `taskid=${taskid}&nonce_str=${nonce_str}&=`
  $.H5_News_Done_Result = await postRequestBody(`user/h5_newsdone`,body)
}

// 看看 - 新闻列表👁API
async function News_API() {
  let body = `type_class=1&=`
  $.News_Result = await postRequestBody(`user/news`,body)
}

// 看看 - 新闻完成阅读👁API
async function News_Done_API(nonce_str) {
  let body = `nonce_str=${nonce_str}&=`
  $.News_Done_Result = await postRequestBody(`user/donenews`,body)
}

// 任务 - 点广告领金币📘API
async function Admobile_Show_API() {
  await postRequest(`user/admobile_show`)
}

// 任务 - 点击广告详细信息📘API
async function Admobile_Click_API(ad_id){
  let body = `ad_id=${ad_id}&=`
  $.Admobile_Click_Result = await postRequestBody(`user/admobile_click`,body)
}

// 任务 - 点击广告领取奖励📘API
async function Admobile_Done_API(ad_id,nonce_str) {
  let body = `nonce_str=${nonce_str}&ad_id=${ad_id}&=`
  $.Admobile_Done_Result = await postRequestBody(`user/admobile_done`,body)
}

// 任务 - 看视频赚金币📺API
async function Watch_Video_API() {
  let body = `mini_pos=0&c_type=1&=`
  $.Watch_Video_Result = await postRequestBody(`user/chuansj`,body)
}

// 任务 - 看视频赚金币领取奖励📺API
async function Watch_Video_Done_API(nonce_str) {
  let body = `nonce_str=${nonce_str}&tid=9&pos=2&=`
  $.Watch_Video_Done_Result = await postRequestBody(`you/callback`,body)
}

// 领取任务奖励💰API
async function Renwu_Done_API(taskid) {
  let body = `taskid=${taskid}&=`
  $.Renwu_Done_Result = await postRequestBody(`user/done_renwu`,body)
}

// 提现💴API
async function With_Draw_API(num) {
  let body =`tx=${num}&=`
  $.With_Draw_Result = await postRequestBody(`user/tixian`,body)
}


// 正常请求 增加代码的复用率
// RequestBody
function postRequest(function_id, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.post(taskUrl(function_id), (err, resp, data) => {
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
    url: `${BBB_API_HOST}/${activity}`,
    headers: {
      'Host': 'bububao.duoshoutuan.com',
      'tokenstr': token,
      'User-Agent': 'BBB/133 CFNetwork/1209 Darwin/20.2.0',
    }
  }
}

// 带Body的请求 增加代码的复用率
// RequestBody
function postRequestBody(function_id, body = {}, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.post(BodytaskUrl(function_id, body), (err, resp, data) => {
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

 // BODYURL
 function BodytaskUrl(activity, body={}) {
  return {
    url: `${BBB_API_HOST}/${activity}`,
    body: body,
    headers: {
      'Host': 'bububao.duoshoutuan.com',
      'tokenstr': token,
      'User-Agent': 'BBB/133 CFNetwork/1209 Darwin/20.2.0',
    }
  }
}

// pretty-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}