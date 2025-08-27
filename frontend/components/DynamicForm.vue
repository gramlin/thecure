<script setup lang="ts">
import { ref, watch } from 'vue'

type FieldDef = {
  name: string
  label?: string
  type?: string
  required?: boolean
  options?: Array<{ label: string; value: string }>
}

type LayoutSection = {
  title?: string
  fields: string[]
}

type FormLayout = {
  sections: LayoutSection[]
}

const props = defineProps<{
  layout: FormLayout
  fieldsMeta?: Record<string, FieldDef>
  modelValue?: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: Record<string, any>): void
  (e: 'submit', v: Record<string, any>): void
}>()

const state = ref<Record<string, any>>({ ...(props.modelValue || {}) })

watch(() => props.modelValue, (v) => {
  if (v) state.value = { ...v }
})

function updateField(name: string, value: any) {
  state.value[name] = value
  emit('update:modelValue', state.value)
}

function onSubmit() {
  emit('submit', state.value)
}

const resolvedLabel = (name: string) => props.fieldsMeta?.[name]?.label || name
const resolvedType = (name: string) => props.fieldsMeta?.[name]?.type || 'text'
const isRequired = (name: string) => !!props.fieldsMeta?.[name]?.required
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <div v-for="(section, i) in layout.sections" :key="i" class="space-y-4">
      <h3 v-if="section.title" class="text-lg font-semibold">{{ section.title }}</h3>
      <div class="grid md:grid-cols-2 gap-4">
        <div v-for="field in section.fields" :key="field" class="space-y-1">
          <label class="text-sm font-medium">{{ resolvedLabel(field) }}</label>

          <UInput
            v-if="['text','string','number'].includes(resolvedType(field))"
            :type="resolvedType(field) === 'number' ? 'number' : 'text'"
            v-model="state[field]"
            :required="isRequired(field)"
            @update:model-value="v => updateField(field, v)"
          />

          <UTextarea
            v-else-if="['text','textarea'].includes(resolvedType(field))"
            v-model="state[field]"
            :required="isRequired(field)"
            @update:model-value="v => updateField(field, v)"
          />

          <USelect
            v-else-if="resolvedType(field) === 'select'"
            :options="props.fieldsMeta?.[field]?.options || []"
            v-model="state[field]"
            @update:model-value="v => updateField(field, v)"
          />

          <UCheckbox
            v-else-if="resolvedType(field) === 'checkbox'"
            v-model="state[field]"
            @update:model-value="v => updateField(field, v)"
          />

          <UInput
            v-else
            type="text"
            v-model="state[field]"
            @update:model-value="v => updateField(field, v)"
          />
        </div>
      </div>
    </div>

    <div class="flex gap-3">
      <UButton type="submit">Submit</UButton>
    </div>
  </form>
</template>
