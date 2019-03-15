package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Report;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public interface ReportRepository extends CrudRepository<Report, Long> {

    @Override
    Report save(@Param("report") Report report);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("report") Report report);
}
