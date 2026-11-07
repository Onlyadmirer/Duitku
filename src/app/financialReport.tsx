import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Download } from "lucide-react-native";
import { useTheme } from "@/constants/useTheme";
import { CardListSkeleton } from "@/components/ui/LoadingState";
import {
  useMonthlyTrends,
  useReportByCategory,
  useReportSummary,
} from "@/services/reports/hooks/useReports";
import FinancialReportSection from "@/components/more/FinancialReportSection";
import ExportDataModal from "@/components/more/ExportDataModal";
import MonthYearPickerModal, {
  MONTHS_FULL,
  MONTHS_SHORT,
} from "@/components/ui/MonthYearPickerModal";

const FinancialReportScreen = () => {
  const { theme, isDark } = useTheme();
  const now = useMemo(() => new Date(), []);

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(now.getMonth());
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const selectedMonthKey = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, "0")}`;

  const {
    data: reportSummary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useReportSummary(selectedMonthKey);
  const {
    data: reportByCategoryData,
    isLoading: isCategoryLoading,
    refetch: refetchByCategory,
  } = useReportByCategory(selectedMonthKey);
  const {
    data: monthlyTrendsData,
    isLoading: isTrendsLoading,
    refetch: refetchTrends,
  } = useMonthlyTrends(selectedYear);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchSummary(),
        refetchByCategory(),
        refetchTrends(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchSummary, refetchByCategory, refetchTrends]);

  const isLoading = isSummaryLoading && isCategoryLoading && isTrendsLoading;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <SafeAreaView
        edges={["top"]}
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            {
              backgroundColor: isDark ? "#111726" : theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <ArrowLeft size={18} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerTextCol}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Detail Laporan Keuangan
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            Ringkasan arus kas bulanan & rekap tahunan
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setExportModalVisible(true)}
          style={[
            styles.exportBtn,
            {
              backgroundColor: theme.primarySoftBg,
              borderColor: theme.primarySoftBorder,
            },
          ]}
        >
          <Download size={14} color={theme.primaryText} />
          <Text style={[styles.exportBtnText, { color: theme.primaryText }]}>
            Ekspor
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primaryText}
            colors={[theme.primaryText]}
          />
        }
      >
        {isLoading ? (
          <CardListSkeleton rows={4} label="Memuat laporan keuangan..." />
        ) : (
          <FinancialReportSection
            selectedMonthShort={MONTHS_SHORT[selectedMonthIdx]}
            selectedMonthFull={MONTHS_FULL[selectedMonthIdx]}
            selectedYear={selectedYear}
            selectedMonthIdx={selectedMonthIdx}
            income={reportSummary?.income ?? 0}
            expense={reportSummary?.expense ?? 0}
            incomeCount={reportSummary?.incomeCount ?? 0}
            expenseCount={reportSummary?.expenseCount ?? 0}
            categories={reportByCategoryData?.items ?? []}
            monthlyTrends={monthlyTrendsData?.data ?? []}
            onPressMonthSelector={() => setMonthModalVisible(true)}
          />
        )}
      </ScrollView>

      <MonthYearPickerModal
        visible={monthModalVisible}
        selectedYear={selectedYear}
        selectedMonthIdx={selectedMonthIdx}
        onChangeYear={setSelectedYear}
        onSelectMonth={(idx) => {
          setSelectedMonthIdx(idx);
          setMonthModalVisible(false);
        }}
        onClose={() => setMonthModalVisible(false)}
      />

      <ExportDataModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        defaultYear={selectedYear}
        defaultMonthIdx={selectedMonthIdx}
      />
    </View>
  );
};

export default FinancialReportScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
  },
});
