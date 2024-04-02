import { Context } from "koa";
import { Transform, TransformCallback } from "node:stream";

export interface IKoaSSEOptions {
  pingInterval?: number;
  closeEvent?: string;
}

export interface IKoaSSEvent {
  id?: number;
  data?: string | object;
  event?: string;
}

export class KoaSSE extends Transform {
  private readonly options: IKoaSSEOptions;

  constructor(ctx: Context, options: IKoaSSEOptions) {
    super({ writableObjectMode: true });
    this.options = options;

    ctx.req.socket.setTimeout(0);
    ctx.req.socket.setNoDelay(true);
    ctx.req.socket.setKeepAlive(true);

    ctx.set("Content-Type", "text/event-stream");
    ctx.set("Cache-Control", "no-cache, no-transform");
    ctx.set("Connection", "keep-alive");

    this.keepAlive();
  }

  public keepAlive() {
    this.push(":\n\n");
  }

  public send(data: IKoaSSEvent | string) {
    try {
      this.write(data);
    } catch (error) {
      console.error("Cannot write to already destroyed stream");
    }
  }

  public close() {
    const data: IKoaSSEvent = {
      event: this.options.closeEvent
    };
    this.end(data);
  }

  public _transform(data: any, _: string, cb: TransformCallback): void {
    // Handle string data 
    if (typeof data === "string") {
      this.push(`data: ${data}\n\n`);
      return cb();
    }

    // Handle object data 
    if (data.id) {
      this.push(`id: ${data.id}\n`);
    }
    if (data.event) {
      this.push(`event: ${data.event}\n`);
    }
    const text = typeof data.data === "object"
      ? JSON.stringify(data.data)
      : data.data;
    this.push(`data: ${text}\n\n`);
    return cb();
  }
}