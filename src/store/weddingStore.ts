import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WeddingPlan,
  AppState,
  Furniture,
  Guest,
  Decoration,
  CeremonyStep,
  TodoItem,
  SceneType,
  TimeMode,
  StageConfig,
  Position,
  FurnitureType,
  DecorationType,
} from './types';
import {
  DEFAULT_CEREMONY_STEPS,
  DEFAULT_TODOS,
  FURNITURE_TEMPLATES,
  DECORATION_TEMPLATES,
} from '@/constants/templates';

const generateId = () => Math.random().toString(36).substring(2, 11);

const createDefaultPlan = (id: string, name: string): WeddingPlan => ({
  id,
  name,
  sceneType: 'island',
  timeMode: 'day',
  stageConfig: {
    x: 400,
    y: 100,
    width: 200,
    height: 120,
    hasTStage: true,
    tStageLength: 150,
    podiumX: 380,
    podiumY: 120,
    podiumStyle: 'classic',
  },
  furniture: [],
  guests: [],
  decorations: [],
  ceremonySteps: [...DEFAULT_CEREMONY_STEPS],
  todos: [...DEFAULT_TODOS],
  musicVolume: 50,
  budget: 0,
  entrancePath: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const initialPlanId = generateId();
const initialPlan = createDefaultPlan(initialPlanId, '我的第一个婚礼方案');

interface WeddingStore extends AppState {
  getCurrentPlan: () => WeddingPlan | undefined;
  createNewPlan: (name: string) => string;
  deletePlan: (planId: string) => void;
  duplicatePlan: (planId: string, newName: string) => string;
  switchPlan: (planId: string) => void;
  renamePlan: (planId: string, newName: string) => void;
  resetPlanToDefault: (planId: string) => void;
  
  setScene: (sceneType: SceneType) => void;
  setTimeMode: (timeMode: TimeMode) => void;
  setStageConfig: (config: Partial<StageConfig>) => void;
  
  addFurniture: (type: FurnitureType, subtype: string, x: number, y: number) => void;
  updateFurniture: (id: string, updates: Partial<Furniture>) => void;
  deleteFurniture: (id: string) => void;
  selectFurniture: (id: string | null) => void;
  
  addGuest: (name: string, isVip: boolean) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  assignGuestToSeat: (guestId: string, seatId: string) => void;
  unassignGuest: (guestId: string) => void;
  
  addDecoration: (type: DecorationType, style: string, x: number, y: number) => void;
  updateDecoration: (id: string, updates: Partial<Decoration>) => void;
  deleteDecoration: (id: string) => void;
  selectDecoration: (id: string | null) => void;
  
  addCeremonyStep: (step: Omit<CeremonyStep, 'id' | 'order'>) => void;
  updateCeremonyStep: (id: string, updates: Partial<CeremonyStep>) => void;
  deleteCeremonyStep: (id: string) => void;
  reorderCeremonySteps: (steps: CeremonyStep[]) => void;
  
  addTodo: (title: string, category: TodoItem['category']) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  
  setBrideImage: (imageData: string | undefined) => void;
  setGroomImage: (imageData: string | undefined) => void;
  setBackgroundMusic: (musicData: string | undefined, musicName: string | undefined) => void;
  setMusicVolume: (volume: number) => void;
  
  setEntrancePath: (path: Position[]) => void;
  setDrawingPath: (isDrawing: boolean) => void;
  setActiveTool: (tool: AppState['activeTool']) => void;
  
  toggleComparePlan: (planId: string) => void;
  clearComparePlans: () => void;
  
  calculateBudget: (planId: string) => number;
  exportPlanData: (planId: string) => object;
}

export const useWeddingStore = create<WeddingStore>()(
  persist(
    (set, get) => ({
      currentPlanId: initialPlanId,
      plans: { [initialPlanId]: initialPlan },
      selectedFurnitureId: null,
      selectedDecorationId: null,
      comparePlanIds: [],
      isDrawingPath: false,
      activeTool: 'select',

      getCurrentPlan: () => {
        const { currentPlanId, plans } = get();
        return plans[currentPlanId];
      },

      createNewPlan: (name) => {
        const newId = generateId();
        const newPlan = createDefaultPlan(newId, name);
        set((state) => ({
          plans: { ...state.plans, [newId]: newPlan },
          currentPlanId: newId,
        }));
        return newId;
      },

      deletePlan: (planId) => {
        set((state) => {
          const plans = { ...state.plans };
          delete plans[planId];
          const planIds = Object.keys(plans);
          const newCurrentId = state.currentPlanId === planId
            ? (planIds[0] || generateId())
            : state.currentPlanId;
          
          if (planIds.length === 0) {
            const defaultId = generateId();
            plans[defaultId] = createDefaultPlan(defaultId, '默认方案');
            return { plans, currentPlanId: defaultId, comparePlanIds: [] };
          }
          
          return {
            plans,
            currentPlanId: newCurrentId,
            comparePlanIds: state.comparePlanIds.filter((id) => id !== planId),
          };
        });
      },

      duplicatePlan: (planId, newName) => {
        const { plans } = get();
        const original = plans[planId];
        if (!original) return planId;
        
        const newId = generateId();
        const newPlan: WeddingPlan = {
          ...JSON.parse(JSON.stringify(original)),
          id: newId,
          name: newName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          plans: { ...state.plans, [newId]: newPlan },
          currentPlanId: newId,
        }));
        return newId;
      },

      switchPlan: (planId) => {
        const { plans } = get();
        if (plans[planId]) {
          set({ currentPlanId: planId, selectedFurnitureId: null, selectedDecorationId: null });
        }
      },

      renamePlan: (planId, newName) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [planId]: {
              ...state.plans[planId],
              name: newName,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      resetPlanToDefault: (planId) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [planId]: {
              ...createDefaultPlan(planId, state.plans[planId]?.name || '婚礼方案'),
              createdAt: state.plans[planId]?.createdAt || new Date().toISOString(),
            },
          },
          selectedFurnitureId: null,
          selectedDecorationId: null,
        }));
      },

      setScene: (sceneType) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              sceneType,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setTimeMode: (timeMode) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              timeMode,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setStageConfig: (config) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              stageConfig: {
                ...state.plans[state.currentPlanId].stageConfig,
                ...config,
              },
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      addFurniture: (type, subtype, x, y) => {
        const template = FURNITURE_TEMPLATES.find(
          (t) => t.type === type && t.subtype === subtype
        );
        if (!template) return;

        const newFurniture: Furniture = {
          id: generateId(),
          type,
          subtype,
          x,
          y,
          rotation: 0,
          scale: 1,
          color: template.defaultColor,
          price: template.defaultPrice,
        };

        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              furniture: [...state.plans[state.currentPlanId].furniture, newFurniture],
              updatedAt: new Date().toISOString(),
            },
          },
          selectedFurnitureId: newFurniture.id,
        }));
      },

      updateFurniture: (id, updates) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              furniture: state.plans[state.currentPlanId].furniture.map((f) =>
                f.id === id ? { ...f, ...updates } : f
              ),
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      deleteFurniture: (id) => {
        set((state) => {
          const plan = state.plans[state.currentPlanId];
          const updatedGuests = plan.guests.map((g) =>
            g.seatId === id ? { ...g, seatId: undefined } : g
          );

          return {
            plans: {
              ...state.plans,
              [state.currentPlanId]: {
                ...plan,
                furniture: plan.furniture.filter((f) => f.id !== id),
                guests: updatedGuests,
                updatedAt: new Date().toISOString(),
              },
            },
            selectedFurnitureId: state.selectedFurnitureId === id ? null : state.selectedFurnitureId,
          };
        });
      },

      selectFurniture: (id) => {
        set({ selectedFurnitureId: id, selectedDecorationId: null });
      },

      addGuest: (name, isVip) => {
        const newGuest: Guest = {
          id: generateId(),
          name,
          isVip,
        };

        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              guests: [...state.plans[state.currentPlanId].guests, newGuest],
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      updateGuest: (id, updates) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              guests: state.plans[state.currentPlanId].guests.map((g) =>
                g.id === id ? { ...g, ...updates } : g
              ),
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      deleteGuest: (id) => {
        set((state) => {
          const plan = state.plans[state.currentPlanId];
          const guest = plan.guests.find((g) => g.id === id);
          const updatedFurniture = guest?.seatId
            ? plan.furniture.map((f) =>
                f.id === guest.seatId ? { ...f, guestId: undefined } : f
              )
            : plan.furniture;

          return {
            plans: {
              ...state.plans,
              [state.currentPlanId]: {
                ...plan,
                guests: plan.guests.filter((g) => g.id !== id),
                furniture: updatedFurniture,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      assignGuestToSeat: (guestId, seatId) => {
        set((state) => {
          const plan = state.plans[state.currentPlanId];
          const guest = plan.guests.find((g) => g.id === guestId);
          const oldSeatId = guest?.seatId;
          
          const existingGuestInSeat = plan.guests.find((g) => g.seatId === seatId && g.id !== guestId);

          return {
            plans: {
              ...state.plans,
              [state.currentPlanId]: {
                ...plan,
                guests: plan.guests.map((g) => {
                  if (g.id === guestId) return { ...g, seatId };
                  if (existingGuestInSeat && g.id === existingGuestInSeat.id) return { ...g, seatId: undefined };
                  return g;
                }),
                furniture: plan.furniture.map((f) => {
                  if (f.id === seatId) return { ...f, guestId };
                  if (f.id === oldSeatId) return { ...f, guestId: undefined };
                  if (existingGuestInSeat && f.id === seatId) return { ...f, guestId };
                  return f;
                }),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      unassignGuest: (guestId) => {
        set((state) => {
          const plan = state.plans[state.currentPlanId];
          const guest = plan.guests.find((g) => g.id === guestId);
          const seatId = guest?.seatId;

          return {
            plans: {
              ...state.plans,
              [state.currentPlanId]: {
                ...plan,
                guests: plan.guests.map((g) =>
                  g.id === guestId ? { ...g, seatId: undefined } : g
                ),
                furniture: plan.furniture.map((f) =>
                  f.id === seatId ? { ...f, guestId: undefined } : f
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      addDecoration: (type, style, x, y) => {
        const template = DECORATION_TEMPLATES.find(
          (t) => t.type === type && t.style === style
        );
        if (!template) return;

        const newDecoration: Decoration = {
          id: generateId(),
          type,
          style,
          x,
          y,
          color: template.defaultColor,
          config: {},
          price: template.defaultPrice,
        };

        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              decorations: [...state.plans[state.currentPlanId].decorations, newDecoration],
              updatedAt: new Date().toISOString(),
            },
          },
          selectedDecorationId: newDecoration.id,
        }));
      },

      updateDecoration: (id, updates) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              decorations: state.plans[state.currentPlanId].decorations.map((d) =>
                d.id === id ? { ...d, ...updates } : d
              ),
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      deleteDecoration: (id) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              decorations: state.plans[state.currentPlanId].decorations.filter((d) => d.id !== id),
              updatedAt: new Date().toISOString(),
            },
          },
          selectedDecorationId: state.selectedDecorationId === id ? null : state.selectedDecorationId,
        }));
      },

      selectDecoration: (id) => {
        set({ selectedDecorationId: id, selectedFurnitureId: null });
      },

      addCeremonyStep: (step) => {
        const plan = get().getCurrentPlan();
        if (!plan) return;

        const maxOrder = Math.max(...plan.ceremonySteps.map((s) => s.order), 0);
        const newStep: CeremonyStep = {
          ...step,
          id: generateId(),
          order: maxOrder + 1,
        };

        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              ceremonySteps: [...state.plans[state.currentPlanId].ceremonySteps, newStep],
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      updateCeremonyStep: (id, updates) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              ceremonySteps: state.plans[state.currentPlanId].ceremonySteps.map((s) =>
                s.id === id ? { ...s, ...updates } : s
              ),
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      deleteCeremonyStep: (id) => {
        set((state) => {
          const steps = state.plans[state.currentPlanId].ceremonySteps
            .filter((s) => s.id !== id)
            .sort((a, b) => a.order - b.order)
            .map((s, i) => ({ ...s, order: i + 1 }));

          return {
            plans: {
              ...state.plans,
              [state.currentPlanId]: {
                ...state.plans[state.currentPlanId],
                ceremonySteps: steps,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      reorderCeremonySteps: (steps) => {
        const reorderedSteps = steps.map((s, i) => ({ ...s, order: i + 1 }));
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              ceremonySteps: reorderedSteps,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      addTodo: (title, category) => {
        const newTodo: TodoItem = {
          id: generateId(),
          title,
          completed: false,
          category,
        };

        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              todos: [...state.plans[state.currentPlanId].todos, newTodo],
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      toggleTodo: (id) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              todos: state.plans[state.currentPlanId].todos.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t
              ),
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      deleteTodo: (id) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              todos: state.plans[state.currentPlanId].todos.filter((t) => t.id !== id),
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setBrideImage: (imageData) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              brideImage: imageData,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setGroomImage: (imageData) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              groomImage: imageData,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setBackgroundMusic: (musicData, musicName) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              backgroundMusic: musicData,
              musicName,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setMusicVolume: (volume) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              musicVolume: volume,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setEntrancePath: (path) => {
        set((state) => ({
          plans: {
            ...state.plans,
            [state.currentPlanId]: {
              ...state.plans[state.currentPlanId],
              entrancePath: path,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setDrawingPath: (isDrawing) => {
        set({ isDrawingPath: isDrawing });
      },

      setActiveTool: (tool) => {
        set({ activeTool: tool });
      },

      toggleComparePlan: (planId) => {
        set((state) => ({
          comparePlanIds: state.comparePlanIds.includes(planId)
            ? state.comparePlanIds.filter((id) => id !== planId)
            : [...state.comparePlanIds, planId],
        }));
      },

      clearComparePlans: () => {
        set({ comparePlanIds: [] });
      },

      calculateBudget: (planId) => {
        const plan = get().plans[planId];
        if (!plan) return 0;

        const furnitureCost = plan.furniture.reduce((sum, f) => sum + f.price, 0);
        const decorationCost = plan.decorations.reduce((sum, d) => sum + d.price, 0);
        return furnitureCost + decorationCost;
      },

      exportPlanData: (planId) => {
        const plan = get().plans[planId];
        if (!plan) return {};

        const budget = get().calculateBudget(planId);
        return {
          ...plan,
          budget,
          totalGuests: plan.guests.length,
          vipGuests: plan.guests.filter((g) => g.isVip).length,
          totalFurniture: plan.furniture.length,
          totalDecorations: plan.decorations.length,
          completedTodos: plan.todos.filter((t) => t.completed).length,
          totalTodos: plan.todos.length,
        };
      },
    }),
    {
      name: 'wedding-planner-storage',
      partialize: (state) => ({
        currentPlanId: state.currentPlanId,
        plans: state.plans,
      }),
    }
  )
);
