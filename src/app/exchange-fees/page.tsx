import React from 'react'
// import FeesChartEcharts from "@/components/FeesChartEcharts"
import FeesChart from '@/components/FeesChart'
import { Card } from '@/components/ui/card'

const Page = () => (
    <Card className="pb-4 sm:container sm:mt-8 sm:pb-12">
        <FeesChart />
    </Card>
)

export default Page
