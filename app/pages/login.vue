<script setup lang="ts">
import { object, string, minLength, email } from "zod/mini";

useHead({
  title: "登录",
});

const router = useRouter();
const toast = useToast();

// 表单状态
const formState = ref({
  email: "",
  password: "",
});

const submitting = ref(false);

// 使用精准导入的 zod/mini 函数进行表单验证
const schema = object({
  email: string().check(minLength(1, "请输入邮箱"), email("请输入有效的邮箱地址")),
  password: string().check(minLength(6, "密码长度不能少于6位")),
});

// 登录处理函数
const handleSubmit = async () => {
  submitting.value = true;

  try {
    const response = await $fetch("/api/user/login", {
      method: "POST",
      body: formState.value,
    });

    if (response && response.token) {
      toast.add({
        title: "登录成功",
        description: "正在跳转...",
        color: "success",
      });

      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  } catch (error: any) {
    toast.add({
      title: "登录失败",
      description: error.response?.data?.message || "邮箱或密码错误",
      color: "error",
    });
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">用户登录</h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">欢迎回来</p>
        </div>
      </template>

      <UForm :schema="schema" :state="formState" class="space-y-6" @submit="handleSubmit">
        <!-- 邮箱输入 -->
        <UFormField name="email" label="邮箱">
          <UInput
            v-model="formState.email"
            type="email"
            placeholder="请输入邮箱"
            prefix="lucide:mail"
            :disabled="submitting"
          />
        </UFormField>

        <!-- 密码输入 -->
        <UFormField name="password" label="密码">
          <UInput
            v-model="formState.password"
            type="password"
            placeholder="请输入密码"
            prefix="lucide:key"
            :disabled="submitting"
            :show-password="true"
          />
        </UFormField>

        <!-- 登录按钮 -->
        <UButton type="submit" class="w-full" :loading="submitting">
          {{ submitting ? "登录中..." : "登录" }}
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-center">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            还没有账号?
            <a
              href="#"
              class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              立即注册
            </a>
          </span>
        </div>
      </template>
    </UCard>
  </div>
</template>
