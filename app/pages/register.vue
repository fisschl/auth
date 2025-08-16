<script setup lang="ts">
import { object, string, minLength, email, refine } from "zod/mini";
import PasswordInput from "~/components/PasswordInput.vue";

useHead({
  title: "注册",
});

const router = useRouter();
const toast = useToast();

// 表单状态
const formState = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

// 使用 useMutation 管理注册状态
const { mutate: register, asyncStatus } = useMutation({
  mutation: async (credentials: RegisterCredentials) => {
    const response = await $fetch("/api/user/register", {
      baseURL: "/auth",
      method: "POST",
      body: credentials,
    });
    return response;
  },
  onSuccess: () => {
    toast.add({
      title: "注册成功",
      description: "正在跳转...",
      color: "success",
    });

    // 延迟跳转到登录页面
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  },
  onError: (error: any) => {
    toast.add({
      title: "注册失败",
      description: error.response?.data?.message || "注册过程中出现错误",
      color: "error",
    });
  },
});

// 使用 zod/mini 进行表单验证
const schema = object({
  username: string().check(minLength(2, "用户名长度不能少于2位")),
  email: string().check(minLength(1, "请输入邮箱"), email("请输入有效的邮箱地址")),
  password: string().check(minLength(6, "密码长度不能少于6位")),
  confirmPassword: string().check(minLength(1, "请确认密码")),
}).check(
  refine((data) => data.password === data.confirmPassword, {
    error: "两次输入的密码不一致",
    path: ["confirmPassword"],
  }),
);

// 注册处理函数
const handleSubmit = () => {
  register(formState.value);
};

// 类型定义
type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};
</script>

<template>
  <div class="container flex h-dvh items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
    <UCard>
      <UForm :schema="schema" :state="formState" class="space-y-8" @submit="handleSubmit">
        <!-- 页面标题 -->
        <div class="space-y-2 text-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">创建账户</h1>
          <p class="text-base text-gray-600 dark:text-gray-400">请填写以下信息完成注册</p>
        </div>

        <!-- 用户名输入 -->
        <UFormField name="username" label="用户名">
          <UInput
            v-model="formState.username"
            type="text"
            placeholder="请输入您的用户名"
            icon="i-lucide-user"
            :disabled="asyncStatus === 'loading'"
            size="lg"
          />
        </UFormField>

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

        <!-- 确认密码输入 -->
        <UFormField name="confirmPassword" label="确认密码" required>
          <PasswordInput
            v-model="formState.confirmPassword"
            placeholder="请再次输入您的密码"
            :disabled="asyncStatus === 'loading'"
            size="lg"
          />
        </UFormField>

        <!-- 登录链接 -->
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            已有账户？
            <a
              href="/login"
              class="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              立即登录
            </a>
          </p>
        </div>

        <!-- 注册按钮 -->
        <UButton
          type="submit"
          class="w-full"
          :loading="asyncStatus === 'loading'"
          icon="i-lucide-user-plus"
          size="lg"
          color="primary"
        >
          {{ asyncStatus === "loading" ? "注册中..." : "注册" }}
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
