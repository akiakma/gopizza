import React, { useEffect, useState } from 'react'
import { RouteComponentProps, withRouter } from 'react-router-dom';
import styled from 'styled-components'
import { URL } from 'config';
import Header from "../../shared/Header"
import Banner from "../../shared/Banner"
import MyCal from "./Component/MyCal"
import MyGraph from "./Component/MyGraph"
import MyInfo from "./Component/MyInfo"
import RewardList from "./Component/RewardList"
import MyRewardContTime from "./Component/MyRewardContTime"
import MyRewardContCount from "./Component/MyRewardContCount"
import MyRewardContQuality from "./Component/MyRewardContQuality"
import MyRewardTap from "./Component/MyRewardTap"

interface _props {
    status: boolean,
}

const System = ({ history }: RouteComponentProps) => {

    const [TabName, setTabName] = useState("");

    const [userInfo, setUserInfo] = useState({
        image: "",
        name: "",
        store: "",
        badge: 0,
        coupon: 0,
        badgeList: [],
        couponList: [],
    })

    const [userScore, setUserSocre] = useState({
        quality: 0,
        average_time: 0,
        shortest_time: 0,
        count: 0,
        sauce: 0,
        cheese: 0,
        topping: 0
    })

    const [questList, setquestList] = useState({
        questList: {},
    })

    const [graphData, setGraphData] = useState(
        [
            {
                subject: 'Count', A: 0, fullMark: 100,
            },
            {
                subject: 'Quality', A: 0, fullMark: 100,
            },
            {
                subject: 'Time', A: 0, fullMark: 100,
            },
        ]
    )

    const [pizzaCount, setpizzaCount] = useState({});

    const [idNum, SetIdNum] = useState(0);

    useEffect(() => {

        idGet();
        requestList();

    }, []);


    const TabClick = (arg: string) => {
        setTabName(arg);
    }

    const token: any = window.sessionStorage.getItem('token');

    const idGet = async () => {

        if (token) {
            const id = await fetch(`${URL}/user/get-user-id`, {
                method: "GET",
                headers: {
                    Authorization: token
                }
            })

            if (id.status === 200) {
                const idJson = await id.json();
                SetIdNum(idJson.user_id);
                fetchInfo(idJson.user_id);
                requestList();
            } else {
                alert("Error");
                history.push("/");
            }
        } else {
            history.push("/");
        }

    }

    const fetchInfo = async (num: number) => {

        const info = await fetch(`${URL}/record/user/${String(num)}`, {
            method: "GET",
            headers: {
                Authorization: token
            }
        })

        const score = await fetch(`${URL}/quest/reward/${String(num)}`, {
            method: "GET",
            headers: {
                Authorization: token
            }
        })

        if (info.status === 200 && score.status === 200) {
            const infoJson = await info.json();
            const scoreJson = await score.json();

            setUserInfo({
                image: infoJson.user_info.image,
                name: infoJson.user_info.name,
                store: infoJson.user_info.store_name,
                badge: scoreJson.reward.badge_count,
                coupon: scoreJson.reward.coupon_count,
                badgeList: scoreJson.badge,
                couponList: scoreJson.coupon,
            })

            setUserSocre({
                average_time: infoJson.user_info.average_time === undefined ? 0 : infoJson.user_info.average_time,
                shortest_time: infoJson.user_info.shortest_time === undefined ? 0 : infoJson.user_info.shortest_time,
                count: infoJson.user_info.total_count === undefined ? 0 : infoJson.user_info.total_count,
                quality: infoJson.user_info.average_quality === undefined ? 0 : infoJson.user_info.average_quality,
                sauce: infoJson.user_info.average_sauce === undefined ? 0 : infoJson.user_info.average_sauce,
                cheese: infoJson.user_info.average_cheese === undefined ? 0 : infoJson.user_info.average_cheese,
                topping: infoJson.user_info.average_topping === undefined ? 0 : infoJson.user_info.average_topping
            })

            setGraphData(
                [
                    {
                        subject: 'Count', A: infoJson.user_info.count_standard === undefined ? 0 : Math.floor(infoJson.user_info.count_standard), fullMark: 100,
                    },
                    {
                        subject: 'Quality', A: infoJson.user_info.completion_standard === undefined ? 0 : Math.floor(infoJson.user_info.completion_standard), fullMark: 100,
                    },
                    {
                        subject: 'Time', A: infoJson.user_info.time_standard === undefined ? 0 : Math.floor(infoJson.user_info.time_standard), fullMark: 100,
                    },
                ]
            )
        } else {
            alert("Error");
            history.push("/");
        }


    }


    const requestList = async () => {

        const info = await fetch(`${URL}/quest`, {
            method: "GET",
            headers: {
                Authorization: token
            }
        })

        const myScore = await fetch(`${URL}/quest/get-my-score`, {
            method: "POST",
            headers: {
                Authorization: token
            }
        })

        if (info.status === 200 && myScore.status === 200) {
            const infoJson = await info.json();
            const myScoreJson = await myScore.json();

            setquestList({
                questList: infoJson
            })

            setpizzaCount({
                myScoreJson
            })
        } else {
            alert("Error");
            history.push("/");
        }

    }

    const requestPost = async (arg: _props) => {

        if (arg.status) {

            fetchInfo(idNum);
            requestList();

        }
    }

    const renderSwitch = () => {
        switch (TabName) {
            case "time":
                return <MyRewardContTime />

            case "count":
                return <MyRewardContCount requestPost={requestPost} pizzaCount={pizzaCount} count={questList.questList} />

            case "quality":
                return <MyRewardContQuality />

            default:
                return <MyRewardContTime />
        }
    }

    return (
        <>
            <Header />
            <Banner title="REWARD SYSTEM" background="rgb(222, 222, 80)" navBackground="rgb(206, 208, 29)" routes1="" routes2="" routes3="" routes4="" menu1="" menu2="" menu3="" menu4="" />
            <SystemIntro>
                <SystemIntroTitle>REWARD SYSTEM</SystemIntroTitle>
                <SystemIntroSubTitle>나는 피자를 얼마나 잘 만들까요?</SystemIntroSubTitle>
                <SystemIntroSubTitle>전체적인 내 역량을 숫자와 그래프로 알 수 있습니다!</SystemIntroSubTitle>
            </SystemIntro>
            <SystemSection>
                <UserSection>
                    <MyInfo image={userInfo.image} name={userInfo.name} store={userInfo.store} badge={userInfo.badge} coupon={userInfo.coupon} />
                    <MyCal shortest_time={userScore.shortest_time} count={userScore.count} topping={userScore.topping} cheese={userScore.cheese} sauce={userScore.sauce} average_time={userScore.average_time} quality={userScore.quality} />
                    <MyGraph data={graphData} />
                </UserSection>
                <RewardList badgeList={userInfo.badgeList} couponList={userInfo.couponList} />
                <AwardSection>
                    <MyRewardTap TabClick={TabClick} />
                    <AwardBox>
                        {renderSwitch()}
                    </AwardBox>
                </AwardSection>
            </SystemSection>
        </>
    )
}

const SystemIntro = styled.section`
    margin: 60px 0 40px;
`

const SystemIntroTitle = styled.div`
    text-align: center;
    -webkit-letter-spacing: 0.1rem;
    -moz-letter-spacing: 0.1rem;
    -ms-letter-spacing: 0.1rem;
    letter-spacing: 0.1rem;
    color: #333;
    text-transform: uppercase;
    margin: 0;
    font: 2.5rem/1.071rem 'Bebas Neue',cursive;
    margin-bottom: 20px;
`

const SystemIntroSubTitle = styled.div`
    text-align: center;
    -webkit-letter-spacing: 0.1rem;
    -moz-letter-spacing: 0.1rem;
    -ms-letter-spacing: 0.1rem;
    letter-spacing: 0.1rem;
    color: #948780;
    font-weight: 300;
    line-height: 20px;
`

const SystemSection = styled.section`
    max-width: 1090px;
    margin: 0 auto 80px;
    padding: 0 15px 0;
`

const UserSection = styled.section`
  display:flex;
  justify-content:space-between;
  margin-bottom: 20px;

  >div {
    background-color: #f8f8f8;
    border-radius: 10px;
  }
`
const AwardSection = styled.article`
    padding: 30px;
    background-color: #f8f8f8;
    border-radius: 10px;
`

const AwardBox = styled.div`
`

export default System
