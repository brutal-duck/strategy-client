class Sounds implements Isounds {
  constructor(scene: Phaser.Scene) {
    this._scene = scene;
  }

  private _scene: Phaser.Scene;
  private _track: string;
  private _music: Phaser.Sound.BaseSound;
  private _volume: number = 1;

  public resumeMusic(): void {
    this._volume = 1;
    if (this._scene.sound.get(this._track)) {
      // @ts-ignore
      this._music.setVolume(this._volume);
      this._music.resume();
    }
  }

  public playMusic(sound: string): void {
    if (this._scene.sound.get(this._track) && this._track === sound) {
      return;
    }
    this.stopMusic();
    this._track = sound;
    this._music = this._scene.sound.add(this._track, {
      volume: this._volume,
      loop: true
    });
    this._music.play();
  }

  public pauseMusic(): void {
    this._volume = 0;
    if (this._scene.sound.get(this._track)) {
      // @ts-ignore
      this._music.setVolume(this._volume);
      this._music.pause();
    }
  }

  public stopMusic(): void {
    if (this._scene.sound.get(this._track)) {
      this._music.destroy();
    }
  }

  public play(sound: string): void {
    this._scene.sound.add(sound, {
      volume: this._volume,
      loop: false
    }).play();
  }
}

export default Sounds;