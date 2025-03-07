"use client";
import RightDisplay from "@/components/FormCompsV2/RightDisplayState";
import Table from "@/components/TableBody/Table";
import { ConfirmIndividualSchedule } from "@/hooks/useSchedule";
import FullCalendar from "@fullcalendar/react";
import { DateTime } from "luxon";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";
import { toast } from "react-toastify";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { getExtendProps } from "@/hooks/useSched";
import Loading from "@/components/Loading/loading";

interface User {
  user_id: number;
  username: string;
  password: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  job: string;
  is_exist: string;
}

interface ApiData {
  code: number;
  data: User[];
}
export default function FeedingActivity() {
  const id = useSearchParams().get("id");

  const { isLoading, isFetching, data, refetch, error } = useQuery(
    "userData",
    async () => {
      const response = await fetch(
        `${location.origin}/api/get/Operation/getBatchCheckList/getBatchCheckListFeeding/?batch_id=${id}`
      );
      const data = await response.json();
      return data;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const [filter, setFilter] = useState({
    sortby: "operation_date",
    sortorder: "desc",
    keyword: "",
  });
  const [OpData, setOperationData] = useState<any[]>([]);
  const [parsed, setParsed] = useState<any[]>([]);
  const [colsData, setColsData] = ["username", "name", "job", "phone"];
  const colsName = ["username", "name", "job", "phone"];
  const [isSorting, setisSorting] = useState(false);
  const pathname = "/user_management/owner";
  const [page, setPage] = useState(1);
  const msg = useSearchParams().get("msg");
  const status = useSearchParams().get("status");

  const [showForm, setShowForm] = useState(false);
  const [submitable, getData] = useState<{
    item_id: string;
    item_quantity: string;
    batch_id: string;
    operation_id: string;
    item_unit: string;
  }>();
  const [prevInfo, setPrevInfo] = useState<any>();
  useEffect(() => {
    if (data) {
      if (data.data) {
        setParsed([]);
        data.data.map((item: any) => {
          setParsed((prev) => [
            ...prev,
            {
              id: item.operation_id,
              title: `${item.description} ${item.am_pm} `,
              start: item.operation_date,
              backgroundColor:
                item.status == "overdue"
                  ? "red"
                  : item.status == "today"
                  ? "orange"
                  : item.status == "pending"
                  ? "#87CEEB"
                  : item.status == "confirmed"
                  ? "#008000"
                  : "#87CEEB",

              extendedProps: {
                id: item.operation_id,
                date_diff: DateTime.fromISO(item.operation_date).diffNow("days")
                  .days,
                status: item.status,
                dates: item.operation_date,
              },
            },
          ]);
        });
      } else {
        setParsed([]);
      }
    }
  }, [data, isFetching]);
  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (filter.keyword == "") {
      refetch();
    }
  }, [filter.keyword]);

  useEffect(() => {
    if (msg != null) {
      if (status == "success") {
        toast.success(msg);
      } else {
        toast.error(msg);
      }
    }
  }, []);

  const {
    register: register,
    handleSubmit: handleSubmit,
    formState: { errors },
    setValue: setValue,
    watch,
    trigger,
  } = useForm({
    defaultValues: {
      item_quantity: "",
    },
    criteriaMode: "all",
    mode: "all",
  });

  const onSubmit = (data: any) => {};

  const watchQuantity = watch("item_quantity");

  const {
    data: OperationData,
    isLoading: OperationLoading,
    refetch: OperationDataRefetch,
  } = useQuery(
    [
      "OperationData",
      submitable?.operation_id !== undefined ? submitable?.operation_id : "",
    ],
    async () => {
      const response = await fetch(
        `/api/post/Operation/getOperationDetails/${submitable?.operation_id}`
      );
      const data = await response.json();
      console.log(data);
      return data;
    },
    {
      enabled: false,
    }
  );
  useEffect(() => {
    if (submitable?.operation_id !== undefined) {
      OperationDataRefetch();
    }
  }, [submitable?.operation_id]);

  useEffect(() => {
    if (OperationData) {
      if (OperationData.data) {
        let arrays: any = [];
        OperationData.data.operation.map((item: any) => {
          if (item.type == "Custom") {
            arrays.push({
              operation_detail: item.operation_item_details_id,
              operation_id: item.operation_id,
              item_id: item.item_id,
              item_name: item.item_name,
              quantity: item.quantity,
              totalStocks: item.latest_closing_quantity,
              item_net_weight_unit: item.item_net_weight_unit,
              operation_date: item.operation_date,
            });
          } else {
            arrays.push({
              operation_detail: item.operation_item_details_id,
              operation_id: item.operation_id,
              item_id: item.item_id,
              item_name: item.item_name,
              quantity: "",
              totalStocks: item.latest_closing_quantity,
              item_net_weight_unit: item.item_net_weight_unit,
              operation_date: item.operation_date,
            });
          }
        });
        setOperationData(arrays);
      }
    }
  }, [OperationData]);

  return (
    <>
      <div className="w-full h-auto overflow-y-hidden">
        <div className="w-full h-full flex flex-col lg:flex-row text-base-content">
          <div className="w-11/12 lg:w-1/4 flex h-auto">
            {OperationData == undefined ? (
              <div className="flex flex-col w-full">
                <div className="alert alert-info shadow-lg w-11/12 mx-auto">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current flex-shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>Select and event in calendar first</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-11/12 mx-auto text-base-content">
                <h3 className="font-bold text-lg">Confirm Operation</h3>
                <div className="flex flex-col">
                  <div className="w-full flex flex-row">
                    <span className="text-md font-bold font-mono w-5/12">
                      Operation Date:
                    </span>
                    <span>
                      {DateTime.fromISO(
                        OperationData?.data.operation[0].operation_date
                      )
                        .setZone("Asia/Manila")
                        .toFormat("EEEE',' MMM d',' yyyy")}
                    </span>
                  </div>
                  <div className="w-full flex flex-row">
                    <span className="text-md font-bold font-mono w-5/12">
                      Operation Type:
                    </span>
                    <span>
                      {OperationData?.data.operation[0].operation_name}
                    </span>
                  </div>
                  <div className="w-full flex flex-row">
                    <span className="text-md font-bold font-mono w-5/12">
                      Operation Time:
                    </span>
                    <span>{OperationData?.data.operation[0].am_pm}</span>
                  </div>
                  {OpData.length < 0 ? (
                    <></>
                  ) : (
                    OpData.map((item: any, key: number) => {
                      return (
                        <div
                          className="border-t-2 border-b-2 border-black py-2"
                          key={key}
                        >
                          <div className="w-full flex flex-row">
                            <span className="text-md font-bold font-mono w-5/12">
                              Item:
                            </span>
                            <span>{item.item_name}</span>
                          </div>
                          <div className="w-full flex flex-row">
                            <span className="text-md font-bold font-mono w-5/12">
                              Stocks:
                            </span>
                            <span>{`${item.totalStocks} ${item.item_net_weight_unit}`}</span>
                          </div>
                          <RightDisplay
                            name="item_quantity"
                            label={"Consumed Quantity"}
                            type={"number"}
                            register={register}
                            item_unit={item.item_net_weight_unit}
                            required={true}
                            value={item.quantity}
                            setValue={setOperationData}
                            index={key}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
                <div className=" justify-end mt-4 gap-2">
                  <button
                    className={"btn btn-warning  mx-2"}
                    onClick={async () => {
                      let isAllowed = true;
                      OpData.map((item: any) => {
                        if (item.quantity == 0 || item.quantity == "") {
                          isAllowed = false;
                          toast.error(
                            "Please fill up all the fields.0 Quantity is not allowed"
                          );
                        }
                        if (item.quantity > item.totalStocks) {
                          isAllowed = false;
                          toast.error(
                            "Quantity must not be greater than the total available stocks"
                          );
                        }
                      });

                      console.log(OpData);
                      if (isAllowed) {
                        const returned = await ConfirmIndividualSchedule(
                          OpData
                        );
                        if (returned.code == 200) {
                          getData(undefined);
                          setShowForm(false);
                          refetch();
                          setValue("item_quantity", "");
                          toast.success(returned.message);
                          setPrevInfo(undefined);
                          setOperationData([]);
                        } else {
                          toast.error(returned.message);
                        }
                      } else {
                      }
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className={"btn  "}
                    onClick={() => {
                      setShowForm(false);
                      setOperationData([]);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="w-11/12 lg:w-3/4 flex h-full">
            <div className="w-11/12 mx-auto h-3/4">
              <div className="flex flex-col lg:flex-row ">
                <span className="text-md font-bold font-mono">Legends:</span>
                <div className="flex flex-row">
                  <div className="h-4 w-4 rounded-md done mx-2"></div>
                  <span className="text-sm">Done</span>
                </div>
                <div className="flex flex-row">
                  <div className="h-4 w-4 rounded-md past-due mx-2 my-auto"></div>
                  <span className="text-sm">Past Due</span>
                </div>

                <div className="flex flex-row">
                  <div className="h-4 w-4 rounded-md pending mx-2 my-auto"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <div className="flex flex-row">
                  <div className="h-4 w-4 rounded-md canceled mx-2 my-auto"></div>
                  <span className="text-sm">Canceled</span>
                </div>
                <div className="flex flex-row">
                  <div className="h-4 w-4 rounded-md active-selected mx-2 my-auto"></div>
                  <span className="text-sm">Selected</span>
                </div>
                <div className="flex flex-row">
                  <div className="h-4 w-4 rounded-md today mx-2 my-auto"></div>
                  <span className="text-sm">Today</span>
                </div>
              </div>
              <div className="w-full min-h-screen ">
                {!isFetching || !isLoading ? (
                  <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    height={"auto"}
                    initialDate={new Date()}
                    initialView="dayGridMonth"
                    fixedWeekCount={true}
                    eventClick={(info: any) => {
                      const data = getExtendProps(info);
                      console.log(data.status);
                      if (data.status != "today") {
                        toast.error(
                          "Cannot edit past due ,future ,or already been confirmed operation."
                        );
                        return;
                      }

                      if (prevInfo == null) {
                        setPrevInfo({
                          prevColor: info.el.style.backgroundColor,
                          info: info,
                        });
                        data.date_diff < 0
                          ? console.log(data)
                          : console.log("");
                        info.el.style.backgroundColor = "#9400D3";
                      } else {
                        if (prevInfo.info.event.id != info.event.id) {
                          setPrevInfo({
                            prevColor: info.el.style.backgroundColor,
                            info: info,
                          });
                        }
                        prevInfo.info.el.style.backgroundColor =
                          prevInfo.prevColor;
                        data.date_diff < 0
                          ? console.log(data)
                          : console.log("");
                        info.el.style.backgroundColor = "#9400D3";
                      }
                      setOperationData([]);
                      getData({
                        item_id: "",
                        item_quantity: "",
                        batch_id: "",
                        operation_id: data.id,
                        item_unit: "",
                      });
                    }}
                    dayHeaders={true}
                    events={parsed}
                    eventDisplay="block"
                    dayMaxEvents={true}
                    displayEventTime={false}
                  />
                ) : (
                  <Loading></Loading>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
