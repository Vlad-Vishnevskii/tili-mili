"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Button, Input, Segmented, Select } from "antd";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  getDeliveryDateOptions,
  getDeliveryTimeIntervalOptions,
  type DeliveryRegion,
} from "@/app/lib/delivery-dates";
import { createOrderRequest } from "@/app/lib/order-requests";
import type { SiteSettings } from "@/app/lib/site-data";
import styles from "./cart-modal.module.css";

const CART_MODAL_DISCLAIMER =
  "Данный сайт носит исключительно информационный характер и ни при каких условиях не является публичной офертой, определяемой положениями Статьи 437 Гражданского кодекса Российской Федерации.";

type ProductInfo = {
  id: number;
  name: string;
  img: string;
  link: string;
  freezeLabel?: string;
  unit: {
    name: string;
  };
};

type CartProduct = {
  quantity: number;
  packageWeight: number;
  itemWeight: number;
  itemTotal: number;
  product: ProductInfo;
};

type CartModalProps = {
  amountLeftForFreeDelivery: number;
  cartProducts: CartProduct[];
  isOpen: boolean;
  onClearCart: () => void;
  onClose: () => void;
  onRemoveItem: (productId: number) => void;
  onSubmitSuccess: () => void;
  onUpdateQuantity: (productId: number, nextQuantity: number) => void;
  totalItems: number;
  totalPrice: number;
  totalWeight: number;
  siteSettings: Pick<
    SiteSettings,
    | "deliveryDateSpb"
    | "deliveryDateMsk"
    | "deliveryTimeIntervalsSpb"
    | "deliveryTimeIntervalsMsk"
  >;
};

type CartModalView = "cart" | "checkout";
type CheckoutField =
  | "name"
  | "email"
  | "phone"
  | "deliveryDate"
  | "deliveryTimeInterval"
  | "address"
  | "comment";

const DELIVERY_REGION_OPTIONS: Array<{
  label: string;
  value: DeliveryRegion;
}> = [
  { label: "Москва", value: "msk" },
  { label: "Санкт-Петербург", value: "spb" },
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const formatWeight = (value: number) => value.toFixed(1).replace(".", ",");

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  const normalizedDigits = digits.startsWith("7") ? digits : `7${digits}`;
  const visibleDigits = normalizedDigits.slice(1);

  let result = "+7";

  if (visibleDigits.length > 0) {
    result += ` (${visibleDigits.slice(0, 3)}`;
  }

  if (visibleDigits.length >= 3) {
    result += ")";
  }

  if (visibleDigits.length > 3) {
    result += ` ${visibleDigits.slice(3, 6)}`;
  }

  if (visibleDigits.length > 6) {
    result += `-${visibleDigits.slice(6, 8)}`;
  }

  if (visibleDigits.length > 8) {
    result += `-${visibleDigits.slice(8, 10)}`;
  }

  return result;
};

const getSelectPopupContainer = (triggerNode: HTMLElement) =>
  triggerNode.parentElement ?? document.body;

export const CartModal = ({
  amountLeftForFreeDelivery,
  cartProducts,
  isOpen,
  onClearCart,
  onClose,
  onRemoveItem,
  onSubmitSuccess,
  onUpdateQuantity,
  totalItems,
  totalPrice,
  totalWeight,
  siteSettings,
}: CartModalProps) => {
  const [view, setView] = useState<CartModalView>("cart");
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryRegion: "msk" as DeliveryRegion,
    deliveryDate: "",
    deliveryTimeInterval: "",
    address: "",
    comment: "",
  });
  const [touchedFields, setTouchedFields] = useState<
    Record<CheckoutField, boolean>
  >({
    name: false,
    email: false,
    phone: false,
    deliveryDate: false,
    deliveryTimeInterval: false,
    address: false,
    comment: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const deliveryOptionsByRegion = useMemo(
    () => ({
      msk: {
        dates: getDeliveryDateOptions(siteSettings.deliveryDateMsk),
        timeIntervals: getDeliveryTimeIntervalOptions(
          siteSettings.deliveryTimeIntervalsMsk,
        ),
      },
      spb: {
        dates: getDeliveryDateOptions(siteSettings.deliveryDateSpb),
        timeIntervals: getDeliveryTimeIntervalOptions(
          siteSettings.deliveryTimeIntervalsSpb,
        ),
      },
    }),
    [
      siteSettings.deliveryDateMsk,
      siteSettings.deliveryDateSpb,
      siteSettings.deliveryTimeIntervalsMsk,
      siteSettings.deliveryTimeIntervalsSpb,
    ],
  );
  const selectedDeliveryOptions =
    deliveryOptionsByRegion[checkoutForm.deliveryRegion];
  const hasDeliveryDateOptions = selectedDeliveryOptions.dates.length > 0;
  const hasDeliveryTimeIntervalOptions =
    selectedDeliveryOptions.timeIntervals.length > 0;
  const selectedDeliveryRegionLabel =
    DELIVERY_REGION_OPTIONS.find(
      (item) => item.value === checkoutForm.deliveryRegion,
    )?.label ?? checkoutForm.deliveryRegion;
  const selectedDeliveryDateLabel =
    selectedDeliveryOptions.dates.find(
      (item) => item.value === checkoutForm.deliveryDate,
    )?.label ?? checkoutForm.deliveryDate;
  const selectedDeliveryTimeIntervalLabel =
    selectedDeliveryOptions.timeIntervals.find(
      (item) => item.value === checkoutForm.deliveryTimeInterval,
    )?.label ?? checkoutForm.deliveryTimeInterval;

  const trimmedForm = {
    name: checkoutForm.name.trim(),
    email: checkoutForm.email.trim(),
    phone: checkoutForm.phone.trim(),
    deliveryDate: checkoutForm.deliveryDate.trim(),
    deliveryTimeInterval: checkoutForm.deliveryTimeInterval.trim(),
    address: checkoutForm.address.trim(),
    comment: checkoutForm.comment.trim(),
  };
  const phoneDigitsCount = trimmedForm.phone.replace(/\D/g, "").length;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedForm.email);
  const fieldErrors: Record<CheckoutField, string> = {
    name: trimmedForm.name ? "" : "Укажите имя",
    email: trimmedForm.email
      ? isEmailValid
        ? ""
        : "Введите корректный email"
      : "Укажите email",
    phone: phoneDigitsCount >= 11 ? "" : "Введите телефон полностью",
    deliveryDate:
      !hasDeliveryDateOptions || trimmedForm.deliveryDate
        ? ""
        : "Выберите дату доставки",
    deliveryTimeInterval:
      !hasDeliveryTimeIntervalOptions || trimmedForm.deliveryTimeInterval
        ? ""
        : "Выберите интервал доставки",
    address: trimmedForm.address ? "" : "Укажите адрес доставки",
    comment: "",
  };
  const isCheckoutFormValid = Object.values(fieldErrors).every(
    (value) => !value,
  );

  const handleRequestClose = useCallback(() => {
    setView("cart");
    setSubmitMessage(null);
    setSubmitError(null);
    onClose();
  }, [onClose]);

  const updateFieldValue = (field: CheckoutField, value: string) => {
    setCheckoutForm((current) => ({
      ...current,
      [field]: field === "phone" ? formatPhone(value) : value,
    }));
  };

  const updateDeliveryRegion = (deliveryRegion: DeliveryRegion) => {
    const options = deliveryOptionsByRegion[deliveryRegion];

    setCheckoutForm((current) => ({
      ...current,
      deliveryRegion,
      deliveryDate: options.dates[0]?.value ?? "",
      deliveryTimeInterval: options.timeIntervals[0]?.value ?? "",
    }));
    setTouchedFields((current) => ({
      ...current,
      deliveryDate: false,
      deliveryTimeInterval: false,
    }));
  };

  const touchField = (field: CheckoutField) => {
    setTouchedFields((current) => ({
      ...current,
      [field]: true,
    }));
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleRequestClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleRequestClose, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      setSubmitMessage(null);
      setSubmitError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setCheckoutForm((current) => {
      const options = deliveryOptionsByRegion[current.deliveryRegion];
      const deliveryDate =
        options.dates.length &&
        !options.dates.some((item) => item.value === current.deliveryDate)
          ? options.dates[0].value
          : options.dates.length
            ? current.deliveryDate
            : "";
      const deliveryTimeInterval =
        options.timeIntervals.length &&
        !options.timeIntervals.some(
          (item) => item.value === current.deliveryTimeInterval,
        )
          ? options.timeIntervals[0].value
          : options.timeIntervals.length
            ? current.deliveryTimeInterval
            : "";

      if (
        deliveryDate === current.deliveryDate &&
        deliveryTimeInterval === current.deliveryTimeInterval
      ) {
        return current;
      }

      return {
        ...current,
        deliveryDate,
        deliveryTimeInterval,
      };
    });
  }, [checkoutForm.deliveryRegion, deliveryOptionsByRegion]);

  const resetCheckoutForm = () => {
    setCheckoutForm({
      name: "",
      email: "",
      phone: "",
      deliveryRegion: "msk",
      deliveryDate: "",
      deliveryTimeInterval: "",
      address: "",
      comment: "",
    });
    setTouchedFields({
      name: false,
      email: false,
      phone: false,
      deliveryDate: false,
      deliveryTimeInterval: false,
      address: false,
      comment: false,
    });
  };

  const submitOrder = async () => {
    if (!isCheckoutFormValid || !cartProducts.length) {
      setTouchedFields({
        name: true,
        email: true,
        phone: true,
        deliveryDate: true,
        deliveryTimeInterval: true,
        address: true,
        comment: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage(null);
      setSubmitError(null);

      const response = await createOrderRequest({
        customerName: trimmedForm.name,
        customerEmail: trimmedForm.email,
        customerPhone: trimmedForm.phone,
        deliveryRegion: selectedDeliveryRegionLabel,
        deliveryRegionCode: checkoutForm.deliveryRegion,
        deliveryAddress: trimmedForm.address,
        deliveryDate: selectedDeliveryDateLabel,
        deliveryTimeInterval: selectedDeliveryTimeIntervalLabel,
        comment: trimmedForm.comment,
        items: cartProducts.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          packageWeight: item.packageWeight,
        })),
      });

      setSubmitMessage(
        response?.orderNumber
          ? `Заявка отправлена. Номер: ${response.orderNumber}`
          : "Заявка отправлена. Мы скоро свяжемся с вами.",
      );
      resetCheckoutForm();
      onSubmitSuccess();
      setView("cart");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось отправить заявку. Попробуйте еще раз.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === "undefined" || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className={styles.overlay}
      onClick={handleRequestClose}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-modal-title"
      >
        <div className={styles.modalMain}>
          <div className={styles.modalHeader}>
            <h2 id="cart-modal-title" className={styles.modalTitle}>
              {view === "cart" ? "Мой список" : "Оформление заявки"}
            </h2>

            <div className={styles.modalHeaderActions}>
              <div className={styles.deliveryBadge}>
                <InfoCircleOutlined />
                {amountLeftForFreeDelivery > 0
                  ? `До бесплатной доставки ${formatPrice(amountLeftForFreeDelivery)} ₽`
                  : "Бесплатная доставка доступна"}
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={handleRequestClose}
                aria-label="Закрыть список"
              >
                <CloseOutlined />
              </button>
            </div>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.itemsColumn}>
              {view === "cart" ? (
                cartProducts.length ? (
                  cartProducts.map((item) => (
                    <div className={styles.itemRow} key={item.product.id}>
                      <Link
                        href={item.product.link}
                        className={styles.itemImage}
                        onClick={handleRequestClose}
                      >
                        <Image
                          src={item.product.img}
                          alt={item.product.name}
                          width={96}
                          height={96}
                        />
                      </Link>

                      <div className={styles.itemInfo}>
                        <Link
                          href={item.product.link}
                          className={styles.itemTitle}
                          onClick={handleRequestClose}
                        >
                          {item.product.name}
                        </Link>
                        <div className={styles.itemMeta}>
                          {formatWeight(item.packageWeight)}{" "}
                          {item.product.unit.name} / шт
                        </div>
                        <div className={styles.itemSubmeta}>
                          {item.product.freezeLabel ?? "Фермерский продукт"}
                        </div>
                      </div>

                      <div className={styles.priceWrapper}>
                        <div className={styles.itemCounter}>
                          <button
                            type="button"
                            className={styles.itemCounterButton}
                            onClick={() => {
                              if (item.quantity <= 1) {
                                onRemoveItem(item.product.id);
                                return;
                              }

                              onUpdateQuantity(
                                item.product.id,
                                item.quantity - 1,
                              );
                            }}
                            aria-label="Уменьшить количество"
                          >
                            <MinusOutlined />
                          </button>

                          <span className={styles.itemCounterValue}>
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            className={styles.itemCounterButton}
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.quantity + 1,
                              )
                            }
                            aria-label="Увеличить количество"
                          >
                            <PlusOutlined />
                          </button>
                        </div>

                        <div className={styles.itemPrice}>
                          {formatPrice(item.itemTotal)} ₽
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.itemRemove}
                        onClick={() => onRemoveItem(item.product.id)}
                        aria-label="Удалить товар"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <ShoppingCartOutlined />
                    <strong>Список пока пуст</strong>
                    <span>Добавьте товары, чтобы оформить заявку.</span>
                  </div>
                )
              ) : (
                <div className={styles.checkoutPanel}>
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => setView("cart")}
                  >
                    <ArrowLeftOutlined />
                    Вернуться к списку
                  </button>

                  <div className={styles.checkoutIntro}>
                    <strong>Контактные данные</strong>
                    <span>
                      Оставьте контакты и адрес доставки, а мы свяжемся с вами
                      для подтверждения заявки.
                    </span>
                  </div>

                  <div className={styles.formGrid}>
                    <label className={styles.formField}>
                      <span>Имя</span>
                      <Input
                        value={checkoutForm.name}
                        status={
                          touchedFields.name && fieldErrors.name ? "error" : ""
                        }
                        onBlur={() => touchField("name")}
                        onChange={(event) =>
                          updateFieldValue("name", event.target.value)
                        }
                        placeholder="Как к вам обращаться"
                      />
                      {touchedFields.name && fieldErrors.name ? (
                        <span className={styles.fieldError}>
                          {fieldErrors.name}
                        </span>
                      ) : null}
                    </label>

                    <label className={styles.formField}>
                      <span>Email</span>
                      <Input
                        value={checkoutForm.email}
                        status={
                          touchedFields.email && fieldErrors.email
                            ? "error"
                            : ""
                        }
                        onBlur={() => touchField("email")}
                        onChange={(event) =>
                          updateFieldValue("email", event.target.value)
                        }
                        placeholder="mail@example.com"
                      />
                      {touchedFields.email && fieldErrors.email ? (
                        <span className={styles.fieldError}>
                          {fieldErrors.email}
                        </span>
                      ) : null}
                    </label>

                    <label className={styles.formField}>
                      <span>Телефон</span>
                      <Input
                        value={checkoutForm.phone}
                        status={
                          touchedFields.phone && fieldErrors.phone
                            ? "error"
                            : ""
                        }
                        onBlur={() => touchField("phone")}
                        onChange={(event) =>
                          updateFieldValue("phone", event.target.value)
                        }
                        placeholder="+7 (___) ___-__-__"
                      />
                      {touchedFields.phone && fieldErrors.phone ? (
                        <span className={styles.fieldError}>
                          {fieldErrors.phone}
                        </span>
                      ) : null}
                    </label>

                    <label className={styles.formFieldFull}>
                      <span>Регион доставки</span>
                      <Segmented
                        block
                        className={styles.regionSegmented}
                        options={DELIVERY_REGION_OPTIONS}
                        value={checkoutForm.deliveryRegion}
                        onChange={(value) =>
                          updateDeliveryRegion(value as DeliveryRegion)
                        }
                      />
                    </label>

                    {hasDeliveryDateOptions ? (
                      <label className={styles.formField}>
                        <span>Дата доставки</span>
                        <Select
                          value={checkoutForm.deliveryDate || undefined}
                          options={selectedDeliveryOptions.dates}
                          getPopupContainer={getSelectPopupContainer}
                          status={
                            touchedFields.deliveryDate &&
                            fieldErrors.deliveryDate
                              ? "error"
                              : ""
                          }
                          onBlur={() => touchField("deliveryDate")}
                          onChange={(value) =>
                            updateFieldValue("deliveryDate", value)
                          }
                          size="large"
                        />
                        {touchedFields.deliveryDate &&
                        fieldErrors.deliveryDate ? (
                          <span className={styles.fieldError}>
                            {fieldErrors.deliveryDate}
                          </span>
                        ) : null}
                      </label>
                    ) : null}

                    {hasDeliveryTimeIntervalOptions ? (
                      <label className={styles.formField}>
                        <span>Интервал доставки</span>
                        <Select
                          value={checkoutForm.deliveryTimeInterval || undefined}
                          options={selectedDeliveryOptions.timeIntervals}
                          getPopupContainer={getSelectPopupContainer}
                          status={
                            touchedFields.deliveryTimeInterval &&
                            fieldErrors.deliveryTimeInterval
                              ? "error"
                              : ""
                          }
                          onBlur={() => touchField("deliveryTimeInterval")}
                          onChange={(value) =>
                            updateFieldValue("deliveryTimeInterval", value)
                          }
                          size="large"
                        />
                        {touchedFields.deliveryTimeInterval &&
                        fieldErrors.deliveryTimeInterval ? (
                          <span className={styles.fieldError}>
                            {fieldErrors.deliveryTimeInterval}
                          </span>
                        ) : null}
                      </label>
                    ) : null}

                    <label className={styles.formFieldFull}>
                      <span>Адрес доставки</span>
                      <Input
                        value={checkoutForm.address}
                        status={
                          touchedFields.address && fieldErrors.address
                            ? "error"
                            : ""
                        }
                        onBlur={() => touchField("address")}
                        onChange={(event) =>
                          updateFieldValue("address", event.target.value)
                        }
                        placeholder="Город, улица, дом, подъезд, квартира"
                      />
                      {touchedFields.address && fieldErrors.address ? (
                        <span className={styles.fieldError}>
                          {fieldErrors.address}
                        </span>
                      ) : null}
                    </label>

                    <label className={styles.formFieldFull}>
                      <span>Комментарий к заявке</span>
                      <Input.TextArea
                        value={checkoutForm.comment}
                        status={
                          touchedFields.comment && fieldErrors.comment
                            ? "error"
                            : ""
                        }
                        onBlur={() => touchField("comment")}
                        onChange={(event) =>
                          updateFieldValue("comment", event.target.value)
                        }
                        placeholder="Например, удобное время звонка или детали по доставке"
                        rows={4}
                      />
                      {touchedFields.comment && fieldErrors.comment ? (
                        <span className={styles.fieldError}>
                          {fieldErrors.comment}
                        </span>
                      ) : null}
                    </label>
                  </div>
                </div>
              )}
            </div>

            <aside className={styles.summaryColumn}>
              <div className={styles.summaryStats}>
                <div className={styles.summaryRow}>
                  <span>Кол-во позиций</span>
                  <strong>{totalItems}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Вес посылки</span>
                  <strong>{formatWeight(totalWeight)} кг</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Итого:</span>
                  <strong>{formatPrice(totalPrice)} ₽</strong>
                </div>
              </div>

              <Button
                className={styles.checkoutButton}
                disabled={
                  !cartProducts.length ||
                  isSubmitting ||
                  (view === "checkout" && !isCheckoutFormValid)
                }
                onClick={() => {
                  if (view === "cart") {
                    setView("checkout");
                    setSubmitError(null);
                    return;
                  }

                  void submitOrder();
                }}
              >
                {view === "cart"
                  ? "Оформить заявку"
                  : isSubmitting
                    ? "Отправка..."
                    : "Отправить заявку"}
              </Button>

              {submitMessage ? (
                <span className={styles.submitSuccess}>{submitMessage}</span>
              ) : null}
              {submitError ? (
                <span className={styles.submitError}>{submitError}</span>
              ) : null}
            </aside>
          </div>

          {cartProducts.length > 0 && view === "cart" ? (
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.clearButton}
                onClick={onClearCart}
              >
                <DeleteOutlined />
                Очистить список
              </button>
            </div>
          ) : null}

          <div className={styles.disclaimer}>
            <p>{CART_MODAL_DISCLAIMER}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
