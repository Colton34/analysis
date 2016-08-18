//================== New Global ========================
export const REQUEST_SUFFIX = '_REQUEST';
export const SUCCESS_SUFFIX = '_SUCCESS';
export const FAILURE_SUFFIX = '_FAILURE';

export const LOADING_DONE = 'LOADING_DONE';
export const LOADING_START = 'LOADING_START';

export const THROW_ERROR = 'THROW_ERROR';
export const HIDE_ERROR = 'HIDE_ERROR';

//================== New ReportDS ========================
export const INIT_REPORT_DS = 'INIT_REPORT_DS';
export const INIT_REPORT_DS_REQUEST = 'INIT_REPORT_DS_REQUEST';
export const INIT_REPORT_DS_SUCCESS = 'INIT_REPORT_DS_SUCCESS';
export const INIT_REPORT_DS_FAILURE = 'INIT_REPORT_DS_FAILURE';
//================= New Save ==============================
export const SAVE_BASELINE = 'SAVE_BASELINE';

//=============== New ClassReport =============
export const CHANGE_CLASS = 'CHANGE_CLASS';

//================= New ExamsCache ===================
export const INIT_EXAMCACHE = 'INIT_EXAMCACHE';
export const INIT_EXAMCACHE_SUCCESS = 'INIT_EXAMCACHE_SUCCESS';
export const GET_MORE_EXAMS = 'GET_MORE_EXAMS';
export const GET_MORE_EXAMS_SUCCESS = 'GET_MORE_EXAMS_SUCCESS';

//================= Global ===========================
export const INIT_USER_ME = 'INIT_USER_ME';
export const INIT_USER_ME_SUCCESS = 'INIT_USER_ME_SUCCESS';
export const INIT_USER_ME_FAILURE = 'INIT_USER_ME_FAILURE';
export const ALTER_COMMENT_DIALOG_STATUS = 'ALTER_COMMENT_DIALOG_STATUS';
export const SHOW_DIALOG = 'SHOW_DIALOG';
export const HIDE_DIALOG = 'HIDE_DIALOG';

export const SHOW_LOADING = 'SHOW_LOADING';
export const HIDE_LOADING = 'HIDE_LOADING';

//================= Home =============================
export const INIT_HOME = 'INIT_HOME';
export const INIT_HOME_REQUEST = 'INIT_HOME_REQUEST';
export const INIT_HOME_SUCCESS = 'INIT_HOME_SUCCESS';
export const INIT_HOME_FAILURE = 'INIT_HOME_FAILURE';
export const FETCH_HOME_RAW_DATA_SUCCESS = 'FETCH_HOME_RAW_DATA_SUCCESS';

//注意：这两个变量值是一一对应的，如果修改其中一个，那么另一个也要修改。
export const FROM_YUJUAN_TEXT = '阅卷';
export const FROM_CUSTOM_TEXT = '自定义';
export const FROM_FLAG = {
    '1': FROM_YUJUAN_TEXT,
    '40': FROM_CUSTOM_TEXT
};

export const  PAPER_ORIGIN = {
    system: 'system',
    upload: 'upload'
}
//================= Dashboard ==========================

export const INIT_DASHBOARD = 'INIT_DASHBOARD';
export const INIT_DASHBOARD_REQUEST = 'INIT_DASHBOARD_REQUEST';
export const INIT_DASHBOARD_SUCCESS = 'INIT_DASHBOARD_SUCCESS';
export const INIT_DASHBOARD_FAILURE = 'INIT_DASHBOARD_FAILURE';

//=============== SchoolAnalysis =============================
export const CHANGE_LEVEL = 'CHANGE_LEVEL';
export const CHANGE_LEVEL_BUFFERS = 'CHANGE_LEVEL_BUFFERS';

export const SUBJECTS_WEIGHT = ['语文', '数学', '英语', '理综', '文综', '物理', '化学', '生物', '政治', '历史', '地理'];
export const NUMBER_MAP = {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九',
    10: '十'
};

export const LETTER_MAP = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F',
    6: 'G'
};

//=============== CustomAnalysis =============================
export const ADD_PAPER_INFO = 'ADD_PAPER_INFO';
export const ADD_PAPER_INFO_SUCCESS = 'ADD_PAPER_INFO_SUCCESS';

export const SUBTRACT_PAPER_INFO = 'SUBTRACT_PAPER_INFO';

export const CHECK_ALL_QUESTION = 'CHECK_ALL_QUESTION';
export const CHECK_ONE_QUESTION = 'CHECK_ONE_QUESTION';

export const SET_PAPER_SQM = 'SET_PAPER_SQM';
export const SET_MERGED_SQM = 'SET_MERGED_SQM';
export const CHANGE_QUESTION_NAME = 'CHANGE_QUESTION_NAME';
export const SET_GROUP_MAP = 'SET_GROUP_MAP';

export const SET_PAGE_INDEX = 'SET_PAGE_INDEX';
export const NEXT_PAGE = 'NEXT_PAGE';
export const PREV_PAGE = 'PREV_PAGE';

export const SAVE_CURRENT_SUBJECT = 'SAVE_CURRENT_SUBJECT';
export const SET_ANALYSIS_NAME = 'SET_ANALYSIS_NAME';
export const SET_CREATE_STATUS = 'SET_CREATE_STATUS';
export const EDIT_SUBJECT = 'EDIT_SUBJECT';
export const DELE_SUBJECT = 'DELE_SUBJECT';
export const CHANGE_CURRENT_SUBJECT_NAME = 'CHANGE_CURRENT_SUBJECT_NAME';
export const DISCARD_CURRENT_SUBJECT = 'DISCARD_CURRENT_SUBJECT';
export const UPDATE_SUBJECT_SQM = 'UPDATE_SUBJECT_SQM';
export const SET_CURSUBJECT_SQM = 'SET_CURSUBJECT_SQM';

//===================== RankReport ===========================
export const INIT_RANKREPORT = 'INIT_RANKREPORT';
export const INIT_RANKREPORT_SUCCESS = 'INIT_RANKREPORT_SUCCESS';

//====================== color ==============================
export const COLORS_MAP = {
    A02 : '#EFF1F4',
    A11 : '#de5d44',
    A12 : '#40b1de',
    B03 : '#1daef8',
    B04 : '#69c170',
    B06 : '#f7be38',
    B07 : '#f6953d',
    B08 : '#ee6b52',
    B12 : '#e0f4fc',
    C02:  '#FAFAFA',
    C03 : '#f2f2f2',
    C04 : '#eeeeee',
    C05 : '#e7e7e7',
    C07 : '#BFBFBF',
    C08:  '#B1B1B1',
    C09 : '#999999',
    C10 : '#6a6a6a',
    C11:  '#4d4d4d',
    C12 : '#333333',
    C14 : '#fdfdfd'
}
export const BACKGROUND_COLOR = '#EFF1F4';
export const A11 = '#de5d44';
export const A12 = '#40b1de';
export const B03 = '#59bde5';
export const B04 = '#69c170';
export const B06 = '#f7be38';
export const B07 = '#f6953d';
export const B08 = '#ee6b52';
export const C03 = '#f2f2f2';
export const C04 = '#eeeeee';
export const C05 = '#e7e7e7';
export const C07 = '#BFBFBF';
export const C09 = '#999999';
export const C12 = '#333333';
export const C14 = '#fdfdfd';


//============================  Test ===============================
export const TEST_CHANGE_ONE = 'TEST_CHANGE_ONE';
export const TEST_CHANGE_TWO = 'TEST_CHANGE_TWO';

