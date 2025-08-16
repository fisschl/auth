<script setup lang="ts">
import { object, string, minLength, email, type infer as Infer } from "zod/mini";
import PasswordInput from "~/components/PasswordInput.vue";

useHead({
  title: "登录",
});

const toast = useToast();

// 表单状态
const formState = ref({
  email: "",
  password: "",
});

// 使用 zod/mini 进行表单验证
const schema = object({
  email: string().check(minLength(1, "请输入邮箱"), email("请输入有效的邮箱地址")),
  password: string().check(minLength(6, "密码长度不能少于6位")),
});

// 从 schema 推断类型
type LoginCredentials = Infer<typeof schema>;

// 使用 useMutation 管理登录状态
const { mutate: login, asyncStatus } = useMutation({
  mutation: async (credentials: LoginCredentials) => {
    const response = await $fetch("/api/user/login", {
      baseURL: "/auth",
      method: "POST",
      body: credentials,
    });
    return response;
  },
  onSuccess: () => {
    toast.add({
      title: "登录成功",
      description: "正在跳转...",
      color: "success",
    });
  },
  onError: (error: any) => {
    toast.add({
      title: "登录失败",
      description: error.response?.data?.message || "邮箱或密码错误",
      color: "error",
    });
  },
});

// 登录处理函数
const handleSubmit = () => {
  login(formState.value);
};
</script>

<template>
  <div class="container flex h-dvh items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
    <UCard>
      <UForm :schema="schema" :state="formState" class="space-y-8" @submit="handleSubmit">
        <!-- 页面标题 -->
        <div class="space-y-2 text-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">欢迎回来</h1>
          <p class="text-base text-gray-600 dark:text-gray-400">请登录您的账户</p>
        </div>

        <!-- 邮箱输入 -->
        <UFormField name="email" label="邮箱地址">
          <UInput
            v-model="formState.email"
            type="email"
            placeholder="请输入您的邮箱地址"
            icon="i-lucide-mail"
            :disabled="asyncStatus === 'loading'"
            size="lg"
          />
        </UFormField>

        <!-- 密码输入 -->
        <UFormField name="password" label="密码" required>
          <PasswordInput
            v-model="formState.password"
            placeholder="请输入您的密码"
            :disabled="asyncStatus === 'loading'"
            size="lg"
          />
        </UFormField>

        <!-- 注册链接 -->
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            还没有账号？
            <a
              href="/register"
              class="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              立即注册
            </a>
          </p>
        </div>

        <!-- 登录按钮 -->
        <UButton
          type="submit"
          class="w-full"
          :loading="asyncStatus === 'loading'"
          icon="i-lucide-login"
          size="lg"
          color="primary"
        >
          {{ asyncStatus === "loading" ? "登录中..." : "登录" }}
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
