
import { ToolConfig, ToolType } from './types';

export const TOOLS: ToolConfig[] = [
  {
    id: ToolType.AI_PACK,
    title: 'Drapicorn AI 팩',
    description: '종합: 도식화 + 착장 프리뷰 + 작업지시서를 모두 포함합니다.',
    icon: '🦄'
  },
  {
    id: ToolType.MATERIAL_ENHANCE,
    title: '소재 리얼리즘',
    description: '이미지 전용: 원단의 질감, 광택, 미세 텍스처를 더해 사실감을 높입니다.',
    icon: '🧶'
  },
  {
    id: ToolType.PRO_TECHPACK,
    title: '프로 작업지시서',
    description: '텍스트 전용: 고정 템플릿 기반의 전문 작업지시서를 생성합니다.',
    icon: '📋'
  },
  {
    id: ToolType.CLOTH_ONLY_FLAT,
    title: '의류 추출 도식',
    description: '이미지 전용: 스케치에서 인체를 제외한 옷만 추출합니다.',
    icon: '✂️'
  },
  {
    id: ToolType.REAL_FLAT,
    title: '리얼 플랫 도식',
    description: '이미지 전용: 앞/뒤 2-up 레이아웃의 선화 도식화를 생성합니다.',
    icon: '📐'
  },
  {
    id: ToolType.FIT_PREVIEW,
    title: '착장 프리뷰',
    description: '이미지 전용: 실제 모델이 착용한 듯한 실사 이미지를 생성합니다.',
    icon: '🧍'
  }
];

export const LOADING_MESSAGES = [
  "Drapicorn 에이전트가 스케치의 실루엣을 분석하고 있습니다...",
  "상의와 하의 스와치 텍스처를 디지털 원단으로 변환 중입니다...",
  "소재의 질감과 조명을 최적화하여 사실감을 불어넣고 있습니다...",
  "모델 치수를 기반으로 최적화된 실측 스펙을 계산 중입니다...",
  "초고해상도 실사 렌더링 엔진이 작동 중입니다. 잠시만 기다려주세요..."
];
