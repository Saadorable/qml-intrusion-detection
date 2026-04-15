export const ATTACK_TYPES = ["DDoS", "BruteForce", "Web", "Botnet"] as const;

export type AttackType = (typeof ATTACK_TYPES)[number];
export type Label = AttackType | "Benign";
export type BurstSize = 1 | 3 | 5;
export type Protocol = "TCP" | "UDP" | "ICMP" | "HTTP" | "HTTPS" | "DNS" | "SSH";

export type PacketRecord = {
  id: string;
  time: string;
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: Protocol;
  actualLabel: Label;
  predictedLabel: Label;
  correct: boolean;
  confidence: number;
  packetSize: number;
  flowDuration: number;
  rate: number;
  synCount: number;
  ackCount: number;
  http: number;
  https: number;
  dns: number;
  tcp: number;
  udp: number;
  iat: number;
  variance: number;
  weight: number;
  note: string;
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, digits = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(digits));
}

function pick<T>(items: readonly T[]) {
  return items[randomInt(0, items.length - 1)];
}

function makePrivateIp() {
  return `10.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

function makeSuspiciousIp() {
  const pools = [
    `45.82.${randomInt(0, 255)}.${randomInt(1, 254)}`,
    `185.220.${randomInt(0, 255)}.${randomInt(1, 254)}`,
    `103.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
  ];
  return pick(pools);
}

function makePublicServerIp() {
  return `172.16.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

function makePacketSize(label: Label) {
  if (label === "Benign") return randomInt(200, 1400);
  if (label === "DDoS") return randomInt(60, 420);
  if (label === "BruteForce") return randomInt(80, 900);
  if (label === "Web") return randomInt(180, 1500);
  return randomInt(70, 650);
}

function makeProtocol(label: Label): Protocol {
  const map: Record<Label, Protocol[]> = {
    Benign: ["TCP", "HTTP", "HTTPS", "DNS"],
    DDoS: ["UDP", "TCP"],
    BruteForce: ["TCP", "SSH"],
    Web: ["HTTP", "HTTPS"],
    Botnet: ["TCP", "UDP", "ICMP"],
  };
  return pick(map[label]);
}

function makePrediction(actual: Label): {
  predictedLabel: Label;
  correct: boolean;
  confidence: number;
} {
  const correctChance = actual === "Benign" ? 0.9 : 0.78;
  const correct = Math.random() < correctChance;

  if (correct) {
    return {
      predictedLabel: actual,
      correct: true,
      confidence: actual === "Benign" ? randomFloat(0.82, 0.99, 2) : randomFloat(0.7, 0.97, 2),
    };
  }

  const alternatives: Label[] = ["Benign", ...ATTACK_TYPES].filter((x) => x !== actual) as Label[];
  return {
    predictedLabel: pick(alternatives),
    correct: false,
    confidence: randomFloat(0.45, 0.83, 2),
  };
}

export function buildPacket(actualLabel: Label): PacketRecord {
  const malicious = actualLabel !== "Benign";
  const srcIp = malicious ? makeSuspiciousIp() : makePrivateIp();
  const dstIp = malicious ? makePublicServerIp() : "192.168.1.10";
  const protocol = makeProtocol(actualLabel);
  const prediction = makePrediction(actualLabel);

  const flowDuration = actualLabel === "Benign" ? randomFloat(120, 5000, 2) : randomFloat(8, 1200, 2);
  const rate = actualLabel === "Benign" ? randomFloat(10, 300, 2) : randomFloat(300, 6500, 2);

  const synCount = malicious ? randomInt(5, 140) : randomInt(0, 12);
  const ackCount = malicious ? randomInt(0, 60) : randomInt(8, 180);

  const http = protocol === "HTTP" ? randomInt(1, 8) : 0;
  const https = protocol === "HTTPS" ? randomInt(1, 8) : 0;
  const dns = protocol === "DNS" ? randomInt(1, 8) : 0;
  const tcp = protocol === "TCP" || protocol === "SSH" || protocol === "HTTP" || protocol === "HTTPS" ? 1 : 0;
  const udp = protocol === "UDP" || protocol === "DNS" ? 1 : 0;

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    time: new Date().toLocaleTimeString(),
    srcIp,
    dstIp,
    srcPort: randomInt(1024, 65535),
    dstPort:
      protocol === "HTTP"
        ? 80
        : protocol === "HTTPS"
        ? 443
        : protocol === "DNS"
        ? 53
        : protocol === "SSH"
        ? 22
        : randomInt(1000, 9000),
    protocol,
    actualLabel,
    predictedLabel: prediction.predictedLabel,
    correct: prediction.correct,
    confidence: prediction.confidence,
    packetSize: makePacketSize(actualLabel),
    flowDuration,
    rate,
    synCount,
    ackCount,
    http,
    https,
    dns,
    tcp,
    udp,
    iat: randomFloat(0.01, actualLabel === "Benign" ? 4.2 : 0.7, 3),
    variance: randomFloat(0.05, actualLabel === "Benign" ? 2.5 : 7.8, 3),
    weight: randomFloat(0.1, 1.0, 3),
    note: malicious
      ? `Suspicious flow from ${srcIp} toward ${dstIp}`
      : `Normal session from ${srcIp} toward ${dstIp}`,
  };
}