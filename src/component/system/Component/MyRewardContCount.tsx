import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components'
import Modal from "react-modal";
import { URL } from 'config';

const customStyles = {
    overlay: {
        backgroundColor: "rgba(0,0,0,0.75)",
        zIndex: 10,
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    }
};

let ref: any = null;

Modal.setAppElement('#root')

const MyRewardContCount = (props: any) => {

    const [count, setCount] = useState({
        ...props.count
    })

    const [pizzaCount, setPizzaCount] = useState({
        ...props.pizzaCounts
    })

    const [badgeImg, SetbadgeImg] = useState({
        badge: ""
    });
    const [couponImg, SetcouponImg] = useState({
        coupon: ""
    })

    const [modalIsOpen, setIsOpen] = React.useState(false);
    function openModal() {
        setIsOpen(true);
    }



    function afterOpenModal(refer: any, imgPath: any) {

        let imgString = imgPath.coupon !== undefined ? imgPath.coupon : imgPath.badge;

        refer.children[1].children[0].src = imgString;

        const text = "자동지급 사항이 아니기 때문에 \n 발급되는 시간이 걸릴 수 있으니 양해바랍니다.";
        refer.children[2].innerHTML = text;
        imgPath.coupon !== undefined ? SetcouponImg({ coupon: "" }) : SetbadgeImg({ badge: "" })
    }

    function closeModal() {
        setIsOpen(false);
    }

    React.useEffect(() => {
        setCount({
            ...props.count
        })

        setPizzaCount({
            ...props.pizzaCount.myScoreJson.pizza_counts
        });

    }, [props.count, props.pizzaCounts]);

    const token: any = window.sessionStorage.getItem('token');

    const RewardRequire = async (e: React.MouseEvent<HTMLButtonElement>) => {

        const element = e.currentTarget
        const buttonId = Number(element.getAttribute("data-id"));
        
        if (count.quests[buttonId - 1].is_achieved) {

            const requestPostSend = await fetch(`${URL}/quest/claim/${buttonId}`, {
                method: "POST",
                headers: { Authorization: token }
            });

            if (requestPostSend.ok) {
                const reqJson = await requestPostSend.json();
                reqJson.hasOwnProperty("badge") ? SetbadgeImg({ badge: reqJson.badge }) : SetcouponImg({ coupon: reqJson.coupon })
                props.requestPost({ status: requestPostSend.ok });
                openModal();
            }

        } else {
            alert("달성 이후에 클릭해주세요.")
        }
    };


    return (
        <>
            <div>
                <ul>
                    {Array.isArray(count.quests) && count.quests.map((item: any, idx: number) => {
                        return (
                            <Quest data-id={item.quest_id} key={idx}>
                                <QuestTitle>{item.quest__name}</QuestTitle>
                                <div>
                                    <p>{item.quest__description}</p>
                                    <ProgressAll>
                                        <ProgressBarBox>
                                            <ProgressBarWidth width={String((370 / item.quest__goal) * (pizzaCount[item.quest__category__name] > item.quest__goal ? item.quest__goal : pizzaCount[item.quest__category__name]))}>
                                                <ProgressBar changeColor={item.is_achieved ? "red" : "blue"}></ProgressBar>
                                            </ProgressBarWidth>
                                        </ProgressBarBox>
                                        <ProgressNum>{pizzaCount[item.quest__category__name] > item.quest__goal ? item.quest__goal : pizzaCount[item.quest__category__name]} / {item.quest__goal}</ProgressNum>
                                    </ProgressAll>
                                </div>
                                <QuestButtonBox>
                                    <QuestButton disabled={item.is_achieved && item.is_claimed === false ? false : true} changeColor={item.is_rewarded ? "red" : item.is_claimed ? "orange" : item.is_achieved ? "blue" : "gray"} data-id={item.quest_id} onClick={RewardRequire}>{item.is_rewarded ? "clear!" : item.is_claimed ? "waiting" : "reward"}</QuestButton>
                                    <QuestButtonExplain>{item.is_rewarded ? "퀘스트가 완료되어 리워드가 발급되었습니다." : item.is_claimed ? "리워드 신청완료됐으나, 승인 대기로 리워드 발급 전입니다." : item.is_achieved ? "퀘스트가 완료되었으니 리워드를 신청해주세요!" : "퀘스트를 달성해주세요!"}</QuestButtonExplain>
                                </QuestButtonBox>
                            </Quest>
                        )
                    })}
                </ul>
            </div >

            <Modal
                contentRef={(node: HTMLDivElement) => (ref = node)}
                isOpen={modalIsOpen}
                onAfterOpen={() => { afterOpenModal(ref, (badgeImg.badge.length > 0 ? badgeImg : couponImg)) }}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <QuestCompleteTitle>달성한 리워드를 확인하세요!</QuestCompleteTitle>
                <QuestCompleteImgBox>
                    <img src="" alt="달성 이미지" />
                </QuestCompleteImgBox>
                <QuestCompleteCoupon></QuestCompleteCoupon>
                <QuestCompleteClse onClick={closeModal}>
                    닫기
                </QuestCompleteClse>
            </Modal>
        </>
    );
};

const Quest = styled.li`
    display:flex;
    justify-content:flex-start;
    align-items: center;
    margin-top: 15px;
    padding: 24px 35px;
    background-color: #fff;
    border-radius: 25px;
   
`

const QuestTitle = styled.div`
    width: 130px;
    margin-right: 25px;
    text-align: center;
    line-height: 1.5;
    white-space: pre-line;
    word-break: keep-all;
    padding: 10px 7px 12px;
    color: #fff;
    background-color: #53e6ca;
    border-radius: 7px;
`

const ProgressAll = styled.div`
    display:flex;
    margin-top: 10px;
`

const ProgressBarBox = styled.div`
  width: 370px;
  height: 20px;
  margin-right: 10px;
  background: #d9e0e9;
  border-radius: 7px;
`

const ProgressBarWidth = styled.div<{ width: string }> `
    width: ${props => props.width ? props.width + "px" : "0px"};
`

const Load = keyframes`
    from { width: 0%; }
    to { width: 100%; }
`
const ProgressBar = styled.div<{ changeColor: string }>`
  width: 0;
  height: 20px;
  background: ${props => props.changeColor === "blue" ? "#44b5e9" : "#ffd01e"};
  border: ${props => props.changeColor === "blue" ? "#3486da" : "#e78810"};
  box-shadow: 0px 1px 3px 0px ${props => props.changeColor === "blue" ? "#3486da" : "#e78810"};
  border-radius: 7px;
  animation: ${Load} 2s forwards;
`

const ProgressNum = styled.span`
    font-size: 13.5px;
    color: #666;
    line-height: 16px;
`

const QuestButtonBox = styled.div`
    position: relative;
    margin-left: auto;

    &:hover p{
        visibility: visible;
    }
`

const QuestButton = styled.button<{ changeColor: string }>`
    position: relative;
    width: 140px;
    padding: 17px 0;
    font-family: 'Bebas Neue',cursive;
    text-align: center;
    font-size: 24px;
    font-weight: 300;
    letter-spacing: 0.5px;
    font-weight:${props => props.changeColor === "yellow" ? 600 : 300};
    color:${props => props.changeColor === "red" ? "#fd5a5a" : "#fff"};
    background: ${props => props.changeColor === "gray" ? "#c8cfd5" : props.changeColor === "blue" ? "#45b6fb" : props.changeColor === "orange" ? "orange" : ""};
    border: 2px solid ${props => props.changeColor === "red" ? "#fd5a5a" : ""};
    border-radius: 15px;
    cursor: ${props => props.changeColor === "blue" ? "pointer" : "auto"};
    box-sizing: border-box;
    outline: none;
    z-index:1;

    &:focus {
        outline: none;
    }
`

const QuestButtonExplain = styled.p`
    display: inline-block;
    position: absolute;
    top: 64px;
    right: -2px;
    width: 148px;
    padding: 5px 10px;
    line-height: 1.5;
    text-align: center;
    color: #fff;
    font-size: 12px;
    visibility: hidden;
    background-color: rgba(0,0,0,0.3);
    z-index: 100;
`

const QuestCompleteTitle = styled.h2`
    margin: 10px 0 15px;
    font-size: 18px;
    font-weight: 500;
    text-align:center;
`

const QuestCompleteImgBox = styled.div`
    width: 350px;
    padding: 20px;

    >img {
        width: 100%;
        height: auto;
    }
`

const QuestCompleteCoupon = styled.p`
    white-space: pre-line;
    text-align: center;
    line-height: 1.5;
`

const QuestCompleteClse = styled.button`
    display: block;
    position: relative;  
    width: 60px;
    height: 30px;
    margin: 20px auto 0;
    text-align: center;
    line-height: 25px;
    font-size: 14px;
    color: #fff;
    background-color: #454545;
    border-radius: 8px;
`

export default MyRewardContCount;
