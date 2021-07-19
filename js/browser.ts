import {MatrixCanvas} from "./MatrixCanvas.js";
import {RpcClient} from "./RpcClient.js";
import {Scheduler} from "./Scheduler.js";

//jquery
import $ from "jquery";
import {HtmlPresets} from "./HtmlPresets.js";
import {error, info, progressReset} from "./util.js";
import {RunnerBrowser} from "./RunnerBrowser.js";
import {HtmlCategories} from "./HtmlCategories.js";
// @ts-ignore
window.$ = $;
// @ts-ignore
window.jQuery = $;

require("fomantic-ui-css/semantic");

let rpc;
let runnerBrowser: RunnerBrowser;

function showPage(selector) {
  $(".ledder-page").hide();
  $(selector).show();
  $(window).trigger("resize");
}

window.addEventListener('load',
  () => {

    let scheduler = new Scheduler();
    let matrix = new MatrixCanvas(scheduler, 40, 8, '#ledder-preview');
    matrix.run();


    let htmlPresets = new HtmlPresets(async (animationName, presetName)=> {
      try {
        await runnerBrowser.run(animationName, presetName);
      } catch (e) {
        error("Can't start animation", e);
      }
    })

    let htmlCategories = new HtmlCategories( async (categoryName) => {
      htmlPresets.reload(rpc,categoryName);
      showPage("#ledder-preset-page");
    });

    rpc = new RpcClient(() => {

      progressReset();
      htmlCategories.reload(rpc)

    }, () => {
      matrix.clear();
    });


    runnerBrowser = new RunnerBrowser(matrix, rpc);

    matrix.preset.enableHtml(document.querySelector("#ledder-controls"), (controlName, values) => {
      if (runnerBrowser.live)
        rpc.request("matrix.preset.updateValue", controlName, values)
    })


    $("#ledder-save-preset").on('click', async ()=>{
      await runnerBrowser.presetSave();
      return(htmlPresets.reload(rpc))
    })


    //Page switching
    showPage("#ledder-category-page");
    $(".ledder-show-preset-page").on('click', () => showPage("#ledder-preset-page"))
    $(".ledder-show-control-page").on('click', () => showPage("#ledder-control-page"))
    $(".ledder-show-category-page").on('click', () => showPage("#ledder-category-page"))
  })

