import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

import { colors, fontSize } from "@/lib/theme";

type Props = {
  startDate: string;
  endDate: string;
  actualProgress: number;
  width?: number;
  height?: number;
};

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function planAt(t: number): number {
  return sigmoid((t - 0.5) * 8) * 100;
}

export function SCurveChart({
  startDate,
  endDate,
  actualProgress,
  width = 320,
  height = 180,
}: Props) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const totalMs = end - start;

  const todayT = useMemo(() => {
    if (totalMs <= 0) return 0;
    return Math.max(0, Math.min(1, (now - start) / totalMs));
  }, [start, totalMs, now]);

  const plannedToday = planAt(todayT);

  const padX = 32;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const planPath = useMemo(() => {
    const n = 40;
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = padX + t * innerW;
      const y = padY + innerH - (planAt(t) / 100) * innerH;
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [innerW, innerH]);

  const todayX = padX + todayT * innerW;
  const todayY = padY + innerH - (plannedToday / 100) * innerH;
  const actualY = padY + innerH - (actualProgress / 100) * innerH;

  return (
    <View>
      <View style={styles.legend}>
        <LegendDot color={colors.textMuted} label="Plan" />
        <LegendDot color={colors.primary} label="Actual" />
        <Text style={styles.delta}>
          {actualProgress.toFixed(0)}% / {plannedToday.toFixed(0)}% plan
        </Text>
      </View>
      <Svg width={width} height={height}>
        <Line
          x1={padX}
          y1={padY + innerH}
          x2={padX + innerW}
          y2={padY + innerH}
          stroke={colors.border}
          strokeWidth={1}
        />
        <Line
          x1={padX}
          y1={padY}
          x2={padX}
          y2={padY + innerH}
          stroke={colors.border}
          strokeWidth={1}
        />
        <Line
          x1={todayX}
          y1={padY}
          x2={todayX}
          y2={padY + innerH}
          stroke={colors.textDim}
          strokeWidth={1}
          strokeDasharray="3,3"
        />
        <Path
          d={planPath}
          stroke={colors.textMuted}
          strokeWidth={2}
          fill="none"
        />
        <Line
          x1={padX}
          y1={padY + innerH}
          x2={todayX}
          y2={actualY}
          stroke={colors.primary}
          strokeWidth={2.5}
        />
        <Circle cx={todayX} cy={actualY} r={4} fill={colors.primary} />
        <Circle cx={todayX} cy={todayY} r={3} fill={colors.textMuted} />
        <SvgText
          x={padX - 6}
          y={padY + 4}
          fill={colors.textDim}
          fontSize="10"
          textAnchor="end"
        >
          100%
        </SvgText>
        <SvgText
          x={padX - 6}
          y={padY + innerH + 4}
          fill={colors.textDim}
          fontSize="10"
          textAnchor="end"
        >
          0%
        </SvgText>
        <SvgText
          x={padX}
          y={height - 4}
          fill={colors.textDim}
          fontSize="10"
        >
          {startDate}
        </SvgText>
        <SvgText
          x={padX + innerW}
          y={height - 4}
          fill={colors.textDim}
          fontSize="10"
          textAnchor="end"
        >
          COD {endDate}
        </SvgText>
      </Svg>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textMuted, fontSize: fontSize.xs },
  delta: { color: colors.text, fontSize: fontSize.xs, marginLeft: "auto" },
});
