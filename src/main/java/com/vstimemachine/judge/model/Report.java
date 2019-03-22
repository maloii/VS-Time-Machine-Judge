package com.vstimemachine.judge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Parameter;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.util.Map;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Report {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private TypeReport typeReport;

    @Type(
            type = "org.hibernate.type.SerializableToBlobType",
            parameters = { @Parameter( name = "classname", value = "java.util.HashMap" ) }
    )
    private Map<String, String> parametrs;


    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL)
    private Set<Broadcast> broadcasts;

    @ManyToOne
    private Competition competition;

    public Report(Report report) {
        this.id = report.getId();
        this.name = report.getName();
        this.typeReport = report.getTypeReport();
        this.parametrs = report.getParametrs();
    }
}
