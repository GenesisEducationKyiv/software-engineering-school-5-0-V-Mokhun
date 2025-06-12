import { ConfirmEmailProcessor } from "./confirm-email.processor";

const instance = new ConfirmEmailProcessor();

export default instance.handle.bind(instance);
