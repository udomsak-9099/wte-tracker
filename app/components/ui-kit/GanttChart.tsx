import { ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

import type { TaskScheduleRow } from "@/features/cpm/queries";
import { colors, fontSize } from "@/lib/theme";

type Props = {
  tasks: TaskScheduleRow[];
  width?: number;
};

const ROW_H = 24;
const GAP = 4;
const HEADER_H = 28;
const LABEL_W = 220;

export function GanttChart({ tasks, width = 800 }: Props) {
  if (tasks.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No tasks to display</Text>
      </View>
    );
  }

  const maxFinish = Math.max(
    1,
    ...tasks.map((t) => t.ef_offset_days ?? 0)
  );
  const chartW = width - LABEL_W - 16;
  const dayWidth = chartW / maxFinish;
  const totalH = HEADER_H + tasks.length * (ROW_H + GAP) + 8;

  // Month markers (every ~30 days)
  const monthMarkers: number[] = [];
  for (let d = 0; d <= maxFinish; d += 30) monthMarkers.push(d);

  return (
    <ScrollView horizontal>
      <View style={{ width }}>
        <Svg width={width} height={totalH}>
          {/* Grid: month markers */}
          {monthMarkers.map((d) => (
            <Line
              key={`grid-${d}`}
              x1={LABEL_W + d * dayWidth}
              y1={HEADER_H}
              x2={LABEL_W + d * dayWidth}
              y2={totalH}
              stroke={colors.border}
              strokeWidth={1}
            />
          ))}
          {monthMarkers.map((d) => (
            <SvgText
              key={`label-${d}`}
              x={LABEL_W + d * dayWidth + 2}
              y={HEADER_H - 6}
              fill={colors.textDim}
              fontSize="10"
            >
              D{d}
            </SvgText>
          ))}
          {/* Today line */}
          <Line
            x1={LABEL_W}
            y1={HEADER_H}
            x2={LABEL_W}
            y2={totalH}
            stroke={colors.primary}
            strokeWidth={2}
          />

          {tasks.map((t, i) => {
            const y = HEADER_H + i * (ROW_H + GAP) + 4;
            const x = LABEL_W + (t.es_offset_days ?? 0) * dayWidth;
            const w = Math.max(
              2,
              ((t.ef_offset_days ?? 0) - (t.es_offset_days ?? 0)) * dayWidth
            );
            const slackW = (t.slack_days ?? 0) * dayWidth;
            const fill = t.is_critical ? colors.danger : colors.primary;
            const progressW =
              (t.progress ?? 0) > 0 ? (w * (t.progress ?? 0)) / 100 : 0;

            return (
              <React.Fragment key={t.id}>
                {/* Label */}
                <SvgText
                  x={LABEL_W - 6}
                  y={y + ROW_H / 2 + 4}
                  fill={t.is_critical ? colors.danger : colors.text}
                  fontSize="10"
                  textAnchor="end"
                >
                  {(t.name ?? "").slice(0, 35)}
                </SvgText>
                {/* Bar */}
                <Rect
                  x={x}
                  y={y}
                  width={w}
                  height={ROW_H - 8}
                  rx={3}
                  fill={fill}
                  fillOpacity={0.6}
                  stroke={fill}
                  strokeWidth={1}
                />
                {/* Progress */}
                {progressW > 0 && (
                  <Rect
                    x={x}
                    y={y}
                    width={progressW}
                    height={ROW_H - 8}
                    rx={3}
                    fill={fill}
                  />
                )}
                {/* Slack hatching */}
                {slackW > 0 && !t.is_critical && (
                  <Rect
                    x={x + w}
                    y={y + 4}
                    width={slackW}
                    height={ROW_H - 16}
                    fill={colors.textDim}
                    fillOpacity={0.25}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </ScrollView>
  );
}

import React from "react";

const styles = StyleSheet.create({
  empty: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: colors.textMuted, fontSize: fontSize.sm },
});
