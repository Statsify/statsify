/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import axios, { AxiosInstance } from "axios";
import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";
import {
  ChannelService,
  EmbedBuilder,
  IMessage,
  MessageService,
} from "@statsify/discord";
import { ChartConfiguration, ScriptableLineSegmentContext } from "chart.js";
import { ChartJSSkiaCanvas } from "chartjs-skia-canvas";
import { DateTime } from "luxon";
import { Logger, STATUS_COLORS } from "@statsify/logger";
import { Service } from "typedi";
import { config, findScore } from "@statsify/util";

interface IHypixelStatus {
  data: { timestamp: number; value: number }[];
  summary: {
    mean: number;
  };
}

@Service()
export class HypixelStatusService {
  private messageId: string | null = null;
  private readonly job: SimpleIntervalJob;
  private readonly axios: AxiosInstance;
  private readonly logger = new Logger("HypixelStatusService");

  public constructor(
    private readonly channelService: ChannelService,
    private readonly messageService: MessageService
  ) {
    const task = new AsyncTask("hypixelStatus", this.sendStatus.bind(this));
    this.job = new SimpleIntervalJob({ minutes: 5 }, task);
    this.job.start();

    this.axios = axios.create({
      baseURL: "https://status.hypixel.net/metrics-display/qtxd0x1427g5",
    });
  }

  public async init() {
    const messages = await this.channelService.getMessages(
      config("supportBot.hypixelApiStatusChannel")
    );

    if (messages.length === 0) return this.sendStatus();

    this.messageId =
      messages.find((m) => m.author.id === config("supportBot.applicationId"))?.id ??
      null;

    return this.sendStatus();
  }

  private async sendStatus() {
    this.logger.debug("Sending Hypixel API Status");

    const { labels, values, ping } = await this.fetchData();

    if (!labels.length) {
      this.logger.error("No status data found");
      return;
    }

    const image = await this.renderChart(labels, values);

    const embed = new EmbedBuilder()
      .title((t) => `Hypixel API Status - \`${t(ping)}ms\``)
      .color(this.findStatusColor(ping))
      .image("attachment://status.png");

    const message: IMessage = {
      embeds: [embed],
      files: [{ name: "status.png", data: image, type: "image/png" }],
      attachments: [],
    };

    if (this.messageId) {
      await this.messageService.edit(
        config("supportBot.hypixelApiStatusChannel"),
        this.messageId,
        message
      );
    } else {
      const { id } = await this.messageService.send(
        config("supportBot.hypixelApiStatusChannel"),
        message
      );

      this.messageId = id;
    }
  }

  private async fetchData() {
    try {
      const res = await this.axios.get("/day.json");
      const data = res.data.metrics[0];
      const { data: responses, summary } = data as IHypixelStatus;

      const labels: string[] = [];
      const values: number[] = [];

      // Last 2 hours
      const recentTime = Date.now() - 1000 * 60 * 60 * 2;

      for (const response of responses) {
        const timestamp = response.timestamp * 1000;
        if (timestamp < recentTime) continue;

        const formattedTime = DateTime.fromMillis(timestamp).toLocaleString(
          DateTime.TIME_SIMPLE
        );

        labels.push(formattedTime);
        values.push(response.value);
      }

      return { labels, values, ping: Math.ceil(summary.mean) };
    } catch {
      return { labels: [], values: [], ping: 0 };
    }
  }

  private renderChart(labels: string[], data: number[]) {
    const canvas = new ChartJSSkiaCanvas({ width: 800, height: 300 });

    const formatColor = (ctx: ScriptableLineSegmentContext) => {
      const value = Math.max(data[ctx.p0DataIndex], data[ctx.p1DataIndex]);
      const color = this.findStatusColor(value);
      return `#${color.toString(16).padStart(6, "0")}`;
    };

    const configuration: ChartConfiguration<"line"> = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Hypixel API Status",
            data,
            fill: true,
            segment: {
              borderColor: formatColor,
            },
            cubicInterpolationMode: "monotone",
          },
        ],
      },
      options: {
        responsive: true,
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Time",
            },
          },
          y: {
            title: {
              display: true,
              text: "Response Time (ms)",
            },
          },
        },
      },
    };

    return canvas.renderToBuffer(configuration);
  }

  private findStatusColor(ping: number) {
    const statusScores = [
      { req: 0, color: STATUS_COLORS.success },
      { req: 100, color: 0xffd527 },
      { req: 200, color: STATUS_COLORS.warn },
      { req: 300, color: STATUS_COLORS.error },
      { req: 400, color: 0x5a180b },
    ];

    return findScore(statusScores, ping).color;
  }
}
