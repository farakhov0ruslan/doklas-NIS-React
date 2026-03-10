import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia, getActivePinia } from 'pinia'
import { usePlannerStore } from '@/stores/plannerStore'
import { usePlacesStore } from '@/stores/placesStore'
import DayBlock from '@/components/planner/DayBlock.vue'
import type { DayPlan, Place } from '@/types'

const mockPlace: Place = {
  id: 'p1', name: 'Эрмитаж', category: 'museums',
  shortDescription: '', description: '', duration: 120, price: 500,
  image: '', rating: 4.9, location: '', address: '', openHours: '', tags: [],
}

const makeDayPlan = (dayNumber: number, placeIds: string[]): DayPlan => ({
  dayNumber,
  places: placeIds.map(id => ({ placeId: id, startTime: '09:00', endTime: '10:00' })),
  totalDuration: placeIds.length * 60,
})

beforeEach(() => {
  setActivePinia(createPinia())
  sessionStorage.clear()
})

describe('DayBlock - drag within day', () => {
  it('does not emit reorder when drag start and drop are same index', async () => {
    const wrapper = mount(DayBlock, {
      props: { day: makeDayPlan(1, ['p1']), places: [mockPlace] },
      global: { plugins: [getActivePinia()!] },
    })

    const row = wrapper.findComponent({ name: 'PlaceInDayRow' })
    await row.vm.$emit('dragStart', 0)
    await row.vm.$emit('drop', 0)

    expect(wrapper.emitted('reorder')).toBeFalsy()
  })

  it('emits reorder when indices are different', async () => {
    const p2: Place = { ...mockPlace, id: 'p2', name: 'НГ' }
    const wrapper = mount(DayBlock, {
      props: { day: makeDayPlan(1, ['p1', 'p2']), places: [mockPlace, p2] },
      global: { plugins: [getActivePinia()!] },
    })

    const rows = wrapper.findAllComponents({ name: 'PlaceInDayRow' })
    await rows[0]!.vm.$emit('dragStart', 0)
    await rows[0]!.vm.$emit('drop', 1)

    expect(wrapper.emitted('reorder')).toBeTruthy()
    expect(wrapper.emitted('reorder')![0]).toEqual([1, 0, 1])
  })

  it('shows drag-target class on container dragover', async () => {
    const wrapper = mount(DayBlock, {
      props: { day: makeDayPlan(1, ['p1']), places: [mockPlace] },
      global: { plugins: [getActivePinia()!] },
    })

    await wrapper.find('.block').trigger('dragover')
    expect(wrapper.find('.block--drag-target').exists()).toBe(true)
  })
})

describe('plannerStore - movePlace between days', () => {
  it('moves place from day 1 to day 2 and rebuilds timelines', () => {
    usePlacesStore().all = [mockPlace]
    const planner = usePlannerStore()
    planner.days = [makeDayPlan(1, ['p1']), makeDayPlan(2, [])]
    planner.isGenerated = true

    planner.movePlace(1, 2, 'p1')

    expect(planner.days[0]!.places).toHaveLength(0)
    expect(planner.days[1]!.places.map(p => p.placeId)).toContain('p1')
  })

  it('does nothing if source day does not exist', () => {
    usePlacesStore().all = [mockPlace]
    const planner = usePlannerStore()
    planner.days = [makeDayPlan(1, ['p1'])]
    planner.isGenerated = true

    planner.movePlace(99, 1, 'p1')

    expect(planner.days[0]!.places).toHaveLength(1)
  })

  it('does nothing if placeId not found in source day', () => {
    usePlacesStore().all = [mockPlace]
    const planner = usePlannerStore()
    planner.days = [makeDayPlan(1, ['p1']), makeDayPlan(2, [])]
    planner.isGenerated = true

    planner.movePlace(1, 2, 'nonexistent')

    expect(planner.days[0]!.places).toHaveLength(1)
    expect(planner.days[1]!.places).toHaveLength(0)
  })
})
