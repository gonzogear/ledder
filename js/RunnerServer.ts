import {Matrix} from "./Matrix.js";
import * as animations from "./animations/all.js";
import {PresetStore} from "./PresetStore.js";
import {Preset} from "./Preset.js";

/**
 * Server side runner
 */
export class RunnerServer {
  matrix: Matrix
  private presetStore: PresetStore

  constructor(matrix: Matrix, presetStore: PresetStore) {
    this.matrix = matrix
    this.presetStore = presetStore

  }

  /**
   * Runs specified animation with specified preset
   *
   * @param animationName
   * @param preset
   */
  async run(animationName: string, preset: Preset) {


    if (animationName in animations) {
      console.log("Runner: starting", animationName, preset)
      this.matrix.clear()
      if (preset)
        this.matrix.preset.load(preset);
      new animations[animationName](this.matrix)
      return true
    } else
      return false
  }


}

