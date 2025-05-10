<script setup>
import { useCounterStore } from '../stores/counter'

const counter = useCounterStore()
</script>

<template>
  <main>
    <h1>Welcome to the Home Page</h1>
    <p>Count: {{ counter.count }}</p>
    <p>Double Count: {{ counter.doubleCount }}</p>
    <button @click="counter.increment">Increment</button>
  </main>
</template>

<style lang="scss"></style>
