import { Application } from "@zille/application";
import { Plugin } from "../lib/plugin.lib";

@Application.Injectable()
export class Plugins extends Application {
  private readonly stacks = new Map<string, Plugin>();

  public setup() { }

  public has(name: string) {
    return this.stacks.has(name)
  }

  public get(name: string) {
    return this.stacks.get(name)
  }

  public add(name: string, plugin: Plugin) {
    this.stacks.set(name, plugin);
    return this;
  }

  public del(name: string) {
    if (this.stacks.has(name)) {
      this.stacks.delete(name);
    }
    return this;
  }

  public toArray() {
    return Array.from(this.stacks.values()).map(plugin => plugin.toJSON())
  }
}