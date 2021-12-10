//@ts-ignore
import amplitude from 'amplitude-js';
import Boot from '../scenes/Boot';
type props = {
  [key: string]: string | number;
}
// const VK_ID: number[] = [191781124];
const VK_ID: number[] = [];

class Amplitude implements Iamplitude {
  private scene: Boot;
  private active: boolean;
  private amplitude: any;

  constructor (scene: Boot) {
    this.scene = scene;
    this.amplitude = amplitude;
    this.init();
  }

  private init(): void {
    this.amplitude.getInstance().init(process.env.AMPLITUDE);
    this.active = this.amplitude.getInstance()._isInitialized;
    if (!this.active) return;
    const identify = new this.amplitude.Identify()
      .setOnce('version', this.scene.build);
    this.amplitude.getInstance().identify(identify);
  }

  public setUserProperty(property: string, data: string | number): void {
    if (this.exceptions()) {
      const identify = new this.amplitude.Identify()
        .set(property, data);
      this.amplitude.getInstance().identify(identify);
    }
  }

  public track(event: string, data: props): void {
    if (this.exceptions()) {
      this.amplitude.getInstance().logEvent(event, data);
    }
  }

  public revenue(pack: string, price: number, data: props, type?: string): void {
    if (this.exceptions()) {
      const revenue = new this.amplitude.Revenue()
        .setProductId(pack)
        .setPrice(price)
        .setEventProperties(data);
  
      if (type) revenue.setRevenueType(type);
      this.amplitude.logRevenueV2(revenue);
    }
  }

  private exceptions(): boolean {
    if (!this.active) return false;
    if (VK_ID.some((id: number) => id === this.scene.state.player.id)) return false;
    return true;
  }
}

export default Amplitude;