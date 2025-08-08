import { IRegistryManager } from "@/shared/ports";
import { Registry, collectDefaultMetrics } from "prom-client";

export class RegistryManager implements IRegistryManager {
  private static instance: RegistryManager;
  private readonly registry: Registry;

  private constructor() {
    this.registry = new Registry();
    this.registry.setDefaultLabels({
      serviceName: "notifications-service",
    });

    collectDefaultMetrics({
      register: this.registry,
    });
  }

  public static getInstance(): RegistryManager {
    if (!RegistryManager.instance) {
      RegistryManager.instance = new RegistryManager();
    }
    return RegistryManager.instance;
  }

  public getRegistry(): Registry {
    return this.registry;
  }

  public async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  public getContentType(): string {
    return this.registry.contentType;
  }
} 

export const registryManager = RegistryManager.getInstance();
