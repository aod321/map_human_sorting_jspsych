/**
 * @title map_human_sorting_experiment
 * @description xland map: dynamic sort
 * @version 0.1.0
 *
 * @assets assets/
 */

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";

import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import SurveyHtmlFormPlugin from "@jspsych/plugin-survey-html-form";
import PreloadPlugin from "@jspsych/plugin-preload";
import { initJsPsych } from "jspsych";

/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */
export async function run({ assetPaths, input = {}, environment, title, version }) {
  const jsPsych = initJsPsych();

  const timeline:any = [];
  // Preload assets
  timeline.push({
    type: PreloadPlugin,
    images: assetPaths.images,
    audio: assetPaths.audio,
    video: assetPaths.video,
  });
  
  // filter images with assets/stimulus from assets 
  const stimulus_images = assetPaths.images.filter(function (el) {
    return el.includes("assets/stimulus");
  });
  // filter images with assets/instruction from assets
  const instruction_images = assetPaths.images.filter(function (el) {
    return el.includes("assets/instruction");
  }).sort();
  // naturally sort assetPaths.images
  const sorted_stimulus = stimulus_images.sort(function(a, b) {
    return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
  });
  

  // Switch to fullscreen
  timeline.push({
    type: FullscreenPlugin,
    message: "<p>欢迎来做实验!<br>准备好后,点击下方按钮将进入全屏开始实验!<p/>",
    fullscreen_mode: true,
    button_label: "开始实验"
  });
  var survey = {
    type: SurveyHtmlFormPlugin,
    preamble: '<p>请输入您的信息</b></p>',
    html: `<p>名字: <input name='name' type='text' /></p>
    <p>年龄: <input name='age' type='text' /></p>
    <p>性别: 
      <label>
        <input type="radio" name="gender" value="male" checked>男
      </label>
      <label>
        <input type="radio" name="gender" value="female">女
      </label>
    </p>
            `
  };
  timeline.push(survey);
    /* define instructions trial */
    var instructions = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: `
        <div>
          <p>在本实验中, 屏幕上将会同时显示两张不同的地图, 请你想象自己在地图中完成导航任务的情形，并判断导航任务难度的高低。</p>
          <p>在这里,难度具体是指：在地图中随机初始化你的起点与终点, 均能由起点到达终点的难度. 你需要从展示给你的两张地图中选择出在其中进行导航任务更容易的一张图片，两张图片从左
          至右分别对应键盘上的字母键F和J。</p>
          <p>如图所示, 如果您认为左图更<strong>容易</strong>则按<strong>F</strong>键, 如果您认为右图更<strong>容易</strong>则按<strong>J</strong>键</p>
        </div>
        <div style='display: flex; justify-content: center;'>
          <div>
          <img witdh='512' height='512' style='margin: 0 10px;' src='${instruction_images[0]}'></img>
          <br>
          <p class='small'><strong>按F键选这张</strong></p>
          </div>
          <div>
          <img witdh='512' height='512' style='margin: 0 10px;' src='${instruction_images[1]}'></img>
          <br>
          <p class='small'><strong>按J键选这张</strong></p></div>
        </div>

        <p>清楚上述规则后, 请您按任意键开始正式实验.</p>
      `,
      post_trial_gap: 500
    };
  timeline.push(instructions);

  async function mergeSort(arr: any[]): Promise<any[]> {
    // Initialize the current subarray length to 1
    let currentSubLength = 1;
    while (currentSubLength < arr.length) {
      // Initialize the start index of the left subarray to 0
      let left = 0;
      while (left < arr.length) {
        // Calculate the start index of the right subarray
        let right = left + currentSubLength;
        // Calculate the end index of the left subarray
        let leftEnd = right - 1;
        // Calculate the end index of the right subarray
        let rightEnd = Math.min(right + currentSubLength - 1, arr.length - 1);
        // Merge the left and right subarrays
        await merge(arr, left, leftEnd, rightEnd);
        // Move to the next pair of subarrays
        left = rightEnd + 1;
      }
      // Increase the subarray length
      currentSubLength *= 2;
    }
    return arr;
  }
  
  async function merge(arr: any[], left: number, leftEnd: number, rightEnd: number): Promise<void> {
    // Create a temporary array to store the sorted elements
    const temp: any[] = [];
    // Initialize the start index of the left subarray
    let leftStart = left;
    // Initialize the start index of the right subarray
    let rightStart = leftEnd + 1;
    // Loop through and compare the elements in the left and right subarrays, and store the smaller element in the temporary array
    while (leftStart <= leftEnd && rightStart <= rightEnd) {
    let test = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: `
        <div><h2>选出你认为更容易的地图</h2></div>
        <div style='display: flex; justify-content: center;'>
        <div>
        <img witdh='512' height='512' style='margin: 0 10px;' src='${arr[leftStart]}'></img>
        <br>
        <p class='small'><strong>按F键选这张</strong></p>
        </div>
        <div>
        <img witdh='512' height='512' style='margin: 0 10px;' src='${arr[rightStart]}'></img>
        <br>
        <p class='small'><strong>按J键选这张</strong></p></div>
        </div>
      `,
      choices: ['f', 'j'],
      data:{
        task: 'response',
        stimulus_name: {
          "left": arr[leftStart],
          "right": arr[rightStart]
        }
      },
    }
    let new_timeline:any = [];
    new_timeline.push(test);
    await jsPsych.run(new_timeline);
    let trial = jsPsych.data.get().filter({task: 'response'}).select('response').values.slice(-1)[0];
     if (trial == 'f') { // left
      // if (arr[leftStart] <= arr[rightStart]) {
        temp.push(arr[leftStart]);
        leftStart++;
      } else {
        temp.push(arr[rightStart]);
        rightStart++;
      }
    }
    // Store the remaining elements in the left subarray in the temporary array
    while (leftStart <= leftEnd) {
      temp.push(arr[leftStart]);
      leftStart++;
    }
    // Store the remaining elements in the right subarray in the temporary array
    while (rightStart <= rightEnd) {
      temp.push(arr[rightStart]);
      rightStart++;
    }
    // Copy the elements from the temporary array back to the original array
    let i = 0;
    while (left <= rightEnd) {
      arr[left] = temp[i];
      left++;
      i++;
    }
  }
  await jsPsych.run(timeline);
  let result = await mergeSort(sorted_stimulus);
  // only keep filename like *.png in result
  let filter_result = result.map((item) => {return item.split('/').slice(-1)[0];});
  let finish = {
      type: HtmlKeyboardResponsePlugin,
      stimulus: `
      <div>
        <h1>实验结束!</h1>
        <p>感谢您的参与!<br>请按任意键提交您的结果!</p>
      </div>
    `,
    data:{
      sorted_result: filter_result
    }
  }
  let new_timeline:any = [];
  new_timeline.push(finish);
  await jsPsych.run(new_timeline);
  
  // Return the jsPsych instance so jsPsych Builder can access the experiment results (remove this
  // if you handle results yourself, be it here or in `on_finish()`)
  return jsPsych;
}
