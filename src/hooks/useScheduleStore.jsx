/**
 * useScheduleStore.js
 * Global state management bằng React Context + useReducer
 */
import { createContext, useContext, useReducer, useCallback } from "react";
import { parseExcelFile, extractUniqueValues } from "../utils/excelParser";

const initialState = {
  rawRecords: [],
  filteredRecords: [],
  uniqueClasses: [],
  uniqueTeachers: [],
  uniqueRooms: [],
  filters: {
    lopHoc: "",
    giangVien: "",
    hoiTruong: "",
    buoiHoc: "",
    tuanFilter: "",
    searchText: "",
  },
  loading: false,
  error: null,
  fileName: "",
  viewMode: "table", // "table" | "card"
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload, error: null };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "LOAD_DATA": {
      const records = action.payload;
      const uniqueClasses = extractUniqueValues(records, "lopHoc");
      const uniqueTeachers = extractUniqueValues(records, "giangVien");
      const uniqueRooms = extractUniqueValues(records, "hoiTruong");
      return {
        ...state,
        rawRecords: records,
        filteredRecords: records,
        uniqueClasses,
        uniqueTeachers,
        uniqueRooms,
        filters: { ...initialState.filters },
        loading: false,
        error: null,
        fileName: action.fileName || "",
      };
    }

    case "SET_FILTER": {
      const newFilters = { ...state.filters, ...action.payload };
      const filtered = applyFilters(state.rawRecords, newFilters);
      return { ...state, filters: newFilters, filteredRecords: filtered };
    }

    case "RESET_FILTERS": {
      return {
        ...state,
        filters: { ...initialState.filters },
        filteredRecords: state.rawRecords,
      };
    }

    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };

    case "CLEAR_DATA":
      return { ...initialState };

    default:
      return state;
  }
}

function applyFilters(records, filters) {
  return records.filter((r) => {
    if (filters.lopHoc && r.lopHoc !== filters.lopHoc) return false;
    if (filters.giangVien && !(r.giangVien || "").includes(filters.giangVien)) return false;
    if (filters.hoiTruong && !(r.hoiTruong || "").toLowerCase().includes(filters.hoiTruong.toLowerCase())) return false;
    if (filters.buoiHoc && r.buoiHoc !== filters.buoiHoc) return false;
    if (filters.searchText) {
      const q = filters.searchText.toLowerCase();
      const haystack = [r.lopHoc, r.giangVien, r.hoiTruong, r.monHoc, r.thoiGian, r.phanKhau]
        .join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

const ScheduleContext = createContext(null);

export function ScheduleProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadFile = useCallback(async (file) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const records = await parseExcelFile(file);
      if (records.length === 0) {
        dispatch({ type: "SET_ERROR", payload: "Không tìm thấy dữ liệu lịch học trong file. Vui lòng kiểm tra lại file Excel." });
        return;
      }
      dispatch({ type: "LOAD_DATA", payload: records, fileName: file.name });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    }
  }, []);

  const setFilter = useCallback((payload) => {
    dispatch({ type: "SET_FILTER", payload });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: "RESET_FILTERS" });
  }, []);

  const setViewMode = useCallback((mode) => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  const clearData = useCallback(() => {
    dispatch({ type: "CLEAR_DATA" });
  }, []);

  return (
    <ScheduleContext.Provider value={{ state, loadFile, setFilter, resetFilters, setViewMode, clearData }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider");
  return ctx;
}
